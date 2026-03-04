#!/bin/bash
# Увеличивает лимит открытых файлов для Mac (EMFILE fix)
ulimit -n 65535 2>/dev/null || ulimit -n 1024 2>/dev/null || true
exec npx next dev -H 127.0.0.1
