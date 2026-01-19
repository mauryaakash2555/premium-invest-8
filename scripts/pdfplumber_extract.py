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
                pages.append({"pageNumber": i + 1, "text": text})

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
