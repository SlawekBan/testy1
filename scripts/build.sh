#!/usr/bin/env bash
# Buduje samodzielną wersję HTML (pełny dokument) z fragmentu artefaktu.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist
{
  printf '<!doctype html>\n<html lang="pl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  # <title>, <meta>, <link> i <style> trafiają do <head>, reszta do <body>
  awk '/^<header class="top">/{exit} {print}' app/godzina-finansisty.html
  printf '</head>\n<body>\n'
  awk 'f{print} /^<header class="top">/{f=1; print}' app/godzina-finansisty.html
  printf '</body>\n</html>\n'
} > dist/index.html
echo "Zbudowano dist/index.html ($(wc -c < dist/index.html) B)"
