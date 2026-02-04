import base64
import io
import json
import sys


def main() -> int:
    try:
        raw = sys.stdin.buffer.read()
        if not raw:
            print(json.dumps({"error": "missing_input"}))
            return 2

        # Accept raw bytes (PDF) or base64.
        # If it doesn't start with %PDF, treat as base64.
        if raw[:4] != b"%PDF":
            raw = base64.b64decode(raw)

        import pdfplumber  # type: ignore

        pages = []
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            total_pages = len(pdf.pages)
            page_limit = min(total_pages, 10)
            for i in range(page_limit):
                page = pdf.pages[i]
                text = page.extract_text() or ""
                text = "\n".join([line.rstrip() for line in text.splitlines()]).strip()
                try:
                    # pdfplumber word boxes use a top-origin coordinate system for `top/bottom`
                    # which is convenient for UI highlights.
                    words = page.extract_words(use_text_flow=True, keep_blank_chars=False) or []
                except Exception:
                    words = []

                # Table reconstruction (row-by-row) for DIGITAL_PDF.
                # We return both the extracted cell text and the cell bbox so the UI can
                # highlight the exact numeric source without guessing.
                tables = []
                try:
                    found = page.find_tables() or []
                except Exception:
                    found = []

                for t in found[:8]:
                    try:
                        cells = getattr(t, "cells", None) or []
                        # Group cells into rows using y0 (top) proximity.
                        rows = {}
                        for c in cells:
                            try:
                                x0, top, x1, bottom = float(c[0]), float(c[1]), float(c[2]), float(c[3])
                            except Exception:
                                continue
                            key = round(top, 1)
                            rows.setdefault(key, []).append({"bbox": {"x0": x0, "x1": x1, "top": top, "bottom": bottom}})

                        # Extract text for each cell bbox via cropping.
                        row_keys = sorted(rows.keys())
                        out_rows = []
                        for rk in row_keys:
                            row_cells = rows[rk]
                            # stable sort by x0
                            row_cells.sort(key=lambda z: float(z["bbox"]["x0"]))
                            out_cells = []
                            for cell in row_cells:
                                bb = cell["bbox"]
                                try:
                                    cropped = page.crop((bb["x0"], bb["top"], bb["x1"], bb["bottom"]))
                                    ctext = (cropped.extract_text() or "").strip()
                                except Exception:
                                    ctext = ""
                                out_cells.append({"text": ctext, "bbox": bb})
                            out_rows.append(out_cells)

                        bbox = getattr(t, "bbox", None)
                        if bbox and len(bbox) == 4:
                            tbox = {"x0": float(bbox[0]), "top": float(bbox[1]), "x1": float(bbox[2]), "bottom": float(bbox[3])}
                        else:
                            tbox = None
                        tables.append({"bbox": tbox, "rows": out_rows})
                    except Exception:
                        continue

                # Normalize output so downstream logic never invents values; it only points to sources.
                norm_words = []
                for w in words:
                    wt = (w.get("text") or "").strip()
                    if not wt:
                        continue
                    norm_words.append(
                        {
                            "text": wt,
                            "x0": float(w.get("x0") or 0.0),
                            "x1": float(w.get("x1") or 0.0),
                            "top": float(w.get("top") or 0.0),
                            "bottom": float(w.get("bottom") or 0.0),
                            "doctop": float(w.get("doctop") or 0.0),
                            "direction": w.get("direction"),
                        }
                    )

                pages.append(
                    {
                        "pageNumber": i + 1,
                        "width": float(getattr(page, "width", 0.0) or 0.0),
                        "height": float(getattr(page, "height", 0.0) or 0.0),
                        "text": text,
                        "words": norm_words,
                        "tables": tables,
                    }
                )

        all_text = "\n\n".join([p.get("text", "") for p in pages]).strip()
        # Selectable-text signal: require either enough non-whitespace characters or enough word tokens.
        char_signal = len("".join(all_text.split()))
        word_signal = sum([len(p.get("words", []) or []) for p in pages])
        has_selectable_text = char_signal >= 80 or word_signal >= 25

        print(
            json.dumps(
                {
                    "method": "pdfplumber",
                    "totalPages": total_pages,
                    "pages": pages,
                    "hasSelectableText": has_selectable_text,
                }
            )
        )
        return 0
    except Exception as e:
        print(json.dumps({"error": "pdfplumber_failed", "message": str(e)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
