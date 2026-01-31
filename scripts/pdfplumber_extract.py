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
                    }
                )

        all_text = "\n\n".join([p.get("text", "") for p in pages]).strip()
        has_selectable_text = len("".join(all_text.split())) >= 80

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
