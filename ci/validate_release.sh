#!/usr/bin/env bash
set -euo pipefail

bash ci/run_ocr_tests.sh

echo "OK: ci/run_ocr_tests.sh passed"

# Placeholder: PDF export + DB audit checks run when Supabase + OCR are configured in CI.
# Must ensure every extracted numeric field has a source_file + page + bbox.

exit 0
