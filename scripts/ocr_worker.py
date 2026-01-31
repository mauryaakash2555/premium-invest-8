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
        # For CI/dev portability we avoid pdf2image unless installed.
        return {
            "ok": False,
            "error": "PDF_OCR_NOT_ENABLED",
            "warnings": [
                "Scanned PDF OCR requires pdf2image + poppler. Provide OCR_WORKER_URL or install dependencies.",
                "No automatic guesses were made.",
            ],
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
