import argparse
import base64
import io
import json
import os
import sys
from typing import Any, Dict, List, Optional

# This worker intentionally does NOT guess numeric values.
# It only returns text tokens with bbox + confidence.

DEFAULT_CONF_THRESHOLD = float(os.environ.get("OCR_MIN_CONF", "0.85"))
PDF_PAGE_LIMIT = int(os.environ.get("OCR_PDF_PAGE_LIMIT", "10"))
PDF_RENDER_SCALE = float(os.environ.get("OCR_PDF_RENDER_SCALE", "2.0"))


def _json_out(obj: Any) -> None:
    sys.stdout.write(json.dumps(obj))


def _paddle_available() -> bool:
    try:
        import paddleocr  # noqa: F401

        return True
    except Exception:
        return False


def _tesseract_available() -> bool:
    try:
        import pytesseract  # noqa: F401

        return True
    except Exception:
        return False


def _pdfium_available() -> bool:
    try:
        import pypdfium2  # noqa: F401

        return True
    except Exception:
        return False


def _render_pdf_pages(pdf_bytes: bytes):
    """Render PDF pages to PIL images using pdfium (no poppler dependency).

    Returns list of dicts:
      {pageNumber, pageWidth, pageHeight, renderWidthPx, renderHeightPx, pil}
    """
    import pypdfium2 as pdfium  # type: ignore

    from PIL import Image  # type: ignore

    doc = pdfium.PdfDocument(pdf_bytes)
    n_pages = len(doc)
    limit = min(n_pages, max(1, PDF_PAGE_LIMIT))

    out = []
    for i in range(limit):
        page = doc[i]
        try:
            # pdfium page sizes are in PDF points.
            page_w = float(page.get_width())
            page_h = float(page.get_height())
        except Exception:
            page_w = 0.0
            page_h = 0.0

        bitmap = page.render(scale=PDF_RENDER_SCALE)
        pil = bitmap.to_pil()
        if not isinstance(pil, Image.Image):
            pil = Image.fromarray(pil)

        out.append(
            {
                "pageNumber": i + 1,
                "pageWidth": page_w,
                "pageHeight": page_h,
                "renderWidthPx": int(getattr(pil, "width", 0) or 0),
                "renderHeightPx": int(getattr(pil, "height", 0) or 0),
                "pil": pil,
            }
        )
    return out, n_pages


def _run_paddle_ocr_on_image(pil_img) -> List[Dict[str, Any]]:
    from paddleocr import PaddleOCR  # type: ignore

    ocr = PaddleOCR(use_angle_cls=True, lang="en")
    # PaddleOCR expects ndarray
    import numpy as np

    arr = np.array(pil_img)
    result = ocr.ocr(arr, cls=True)

    blocks: List[Dict[str, Any]] = []
    for line in result or []:
        for item in line or []:
            bbox, (text, conf) = item
            # bbox: [[x,y],[x,y],[x,y],[x,y]]
            xs = [p[0] for p in bbox]
            ys = [p[1] for p in bbox]
            blocks.append(
                {
                    "text": text,
                    "confidence": float(conf) if conf is not None else None,
                    "bbox": {
                        "x0": float(min(xs)),
                        "y0": float(min(ys)),
                        "x1": float(max(xs)),
                        "y1": float(max(ys)),
                    },
                }
            )
    return blocks


def _run_paddle_table_mode(pil_img) -> List[Dict[str, Any]]:
    """Best-effort PaddleOCR table mode.

    Returns table artifacts if PPStructure is available. This is used to satisfy
    the requirement for table-mode processing on scanned PDFs.
    """
    try:
        from paddleocr import PPStructure  # type: ignore

        import numpy as np

        engine = PPStructure(show_log=False, lang="en")
        arr = np.array(pil_img)
        res = engine(arr)
        tables = []
        for item in res or []:
            if not isinstance(item, dict):
                continue
            if item.get("type") != "table":
                continue
            tables.append(
                {
                    "bbox": item.get("bbox"),
                    "html": (item.get("res") or {}).get("html"),
                }
            )
        return tables
    except Exception:
        return []


def _run_tesseract_on_image(pil_img) -> List[Dict[str, Any]]:
    import pytesseract  # type: ignore

    data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
    blocks: List[Dict[str, Any]] = []
    n = len(data.get("text", []))
    for i in range(n):
        text = str(data["text"][i] or "").strip()
        if not text:
            continue
        conf = data.get("conf", [None])[i]
        try:
            conf_f = float(conf) / 100.0 if conf is not None else None
        except Exception:
            conf_f = None

        x = float(data.get("left", [0])[i] or 0)
        y = float(data.get("top", [0])[i] or 0)
        w = float(data.get("width", [0])[i] or 0)
        h = float(data.get("height", [0])[i] or 0)

        blocks.append(
            {
                "text": text,
                "confidence": conf_f,
                "bbox": {"x0": x, "y0": y, "x1": x + w, "y1": y + h},
            }
        )
    return blocks


def extract_from_bytes(payload: Dict[str, Any]) -> Dict[str, Any]:
    b64 = payload.get("base64")
    filename = str(payload.get("filename") or "upload")
    if not b64:
        return {"ok": False, "error": "missing_base64"}

    raw = base64.b64decode(str(b64))

    from PIL import Image  # type: ignore

    is_pdf = filename.lower().endswith(".pdf")

    if is_pdf:
        if not _pdfium_available():
            return {
                "ok": True,
                "method": None,
                "overallConfidence": None,
                "warnings": [
                    "PDF_OCR_NOT_AVAILABLE",
                    "Install pypdfium2 to enable scanned PDF rendering.",
                    "LOW_OCR_CONFIDENCE_DO_NOT_GUESS",
                ],
                "pages": [],
                "fields": [],
            }

        pages, total_pages = _render_pdf_pages(raw)

        warnings: List[str] = []
        attempted_table_mode = False
        any_tables = False
        all_pages = []
        all_conf: List[float] = []

        for p in pages:
            pil = p["pil"]

            page_tables = []
            if _paddle_available():
                attempted_table_mode = True
                page_tables = _run_paddle_table_mode(pil)
                if page_tables:
                    any_tables = True

            blocks: List[Dict[str, Any]] = []
            if _paddle_available():
                try:
                    blocks = _run_paddle_ocr_on_image(pil)
                except Exception as e:
                    warnings.append(f"PaddleOCR failed: {e}")
                    blocks = []

            # Compute page confidence (mean of available confidences).
            confs = [float(b.get("confidence")) for b in blocks if isinstance(b.get("confidence"), (int, float))]
            page_conf = (sum(confs) / len(confs)) if confs else None

            all_pages.append(
                {
                    "pageNumber": p["pageNumber"],
                    "pageWidth": p["pageWidth"],
                    "pageHeight": p["pageHeight"],
                    "renderWidthPx": p["renderWidthPx"],
                    "renderHeightPx": p["renderHeightPx"],
                    "blocks": blocks,
                    "tables": page_tables,
                    "pageConfidence": page_conf,
                }
            )

            if isinstance(page_conf, (int, float)):
                all_conf.append(float(page_conf))

        overall_conf = (sum(all_conf) / len(all_conf)) if all_conf else None

        if attempted_table_mode and not any_tables:
            warnings.append("PADDLE_TABLE_MODE_NO_TABLES_DETECTED")
        if _paddle_available() and not attempted_table_mode:
            warnings.append("PADDLE_TABLE_MODE_UNAVAILABLE")

        # If paddle confidence is too low, fall back to tesseract on rendered pages.
        if overall_conf is None or overall_conf < DEFAULT_CONF_THRESHOLD:
            if not _tesseract_available():
                warnings.append("LOW_OCR_CONFIDENCE_DO_NOT_GUESS")
                return {
                    "ok": True,
                    "method": "paddle_table" if _paddle_available() else None,
                    "overallConfidence": overall_conf,
                    "totalPages": total_pages,
                    "warnings": warnings,
                    "pages": all_pages,
                    "fields": [],
                }

            warnings.append("PADDLE_CONF_BELOW_THRESHOLD_FALLBACK_TESSERACT")
            all_pages_t = []
            all_conf_t: List[float] = []
            for p in pages:
                pil = p["pil"]
                blocks_t: List[Dict[str, Any]] = []
                try:
                    blocks_t = _run_tesseract_on_image(pil)
                except Exception as e:
                    warnings.append(f"Tesseract failed: {e}")
                    blocks_t = []

                confs_t = [float(b.get("confidence")) for b in blocks_t if isinstance(b.get("confidence"), (int, float))]
                page_conf_t = (sum(confs_t) / len(confs_t)) if confs_t else None
                all_pages_t.append(
                    {
                        "pageNumber": p["pageNumber"],
                        "pageWidth": p["pageWidth"],
                        "pageHeight": p["pageHeight"],
                        "renderWidthPx": p["renderWidthPx"],
                        "renderHeightPx": p["renderHeightPx"],
                        "blocks": blocks_t,
                        "tables": [],
                        "pageConfidence": page_conf_t,
                    }
                )
                if isinstance(page_conf_t, (int, float)):
                    all_conf_t.append(float(page_conf_t))

            overall_conf_t = (sum(all_conf_t) / len(all_conf_t)) if all_conf_t else None
            if overall_conf_t is None or overall_conf_t < DEFAULT_CONF_THRESHOLD:
                warnings.append("LOW_OCR_CONFIDENCE_DO_NOT_GUESS")

            return {
                "ok": True,
                "method": "tesseract",
                "overallConfidence": overall_conf_t,
                "totalPages": total_pages,
                "warnings": warnings,
                "pages": all_pages_t,
                "fields": [],
            }

        return {
            "ok": True,
            "method": "paddle_table" if _paddle_available() else None,
            "overallConfidence": overall_conf,
            "totalPages": total_pages,
            "warnings": warnings,
            "pages": all_pages,
            "fields": [],
        }

    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as e:
        return {"ok": False, "error": "invalid_image", "message": str(e), "fields": []}

    blocks: List[Dict[str, Any]] = []
    warnings: List[str] = []

    if _paddle_available():
        try:
            blocks = _run_paddle_ocr_on_image(img)
        except Exception as e:
            warnings.append(f"PaddleOCR failed: {e}")
            blocks = []

    if not blocks and _tesseract_available():
        try:
            blocks = _run_tesseract_on_image(img)
        except Exception as e:
            warnings.append(f"Tesseract failed: {e}")
            blocks = []

    if not blocks:
        return {
            "ok": True,
            "warnings": warnings + ["LOW_OCR_CONFIDENCE"],
            "fields": [],
        }

    # This worker v1 does not do full field mapping for images.
    # It returns blocks so the UI can highlight sources and require manual edits.
    low_conf = [b for b in blocks if (b.get("confidence") is None or float(b.get("confidence") or 0) < DEFAULT_CONF_THRESHOLD)]
    if low_conf:
        warnings.append("LOW_OCR_CONFIDENCE")

    return {
        "ok": True,
        "warnings": warnings,
        "blocks": blocks,
        "fields": [],
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stdin-json", action="store_true")
    args = ap.parse_args()

    if args.stdin_json:
        raw = sys.stdin.read()
        payload = json.loads(raw)
        out = extract_from_bytes(payload)
        _json_out(out)
        return 0

    _json_out({"ok": False, "error": "run_as_service", "message": "Run with --stdin-json or via FastAPI service."})
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
