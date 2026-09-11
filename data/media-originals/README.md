# Media originals (not served)

Local copies of manufacturer/retailer masters **before** web-master ingest.

- **Do not** put these files under `public/` — they are not production assets.
- Binaries are gitignored. Canonical provenance is the registry `sourceUrl`.
- `manifest.json` records sha256, dimensions, licence, and the public web-master path.

See `docs/media-ingest.md`.
