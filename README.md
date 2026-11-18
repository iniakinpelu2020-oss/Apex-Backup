# Apex Backup

Export and restore the Apex suite's local data as a single JSON file. Vanilla HTML/CSS/JS,
relative `./` paths so it runs from `/apps/backup/` inside the ApexOS bundle.

## Run

```sh
python3 -m http.server 8080
# then open http://127.0.0.1:8080/
```

## What it covers

Every `localStorage` key that starts with `apex.` — Notes, Archive, Ledger, Planner, Settings and
anything else that follows the convention. The list shows one row per key with its size.

It does **not** cover IndexedDB (Apex Camera / Gallery blobs), and it cannot reach another browser
profile. Those need their own export.

## File format

```json
{
  "format": "apex-backup",
  "version": 1,
  "exported": "2026-11-18T16:00:00.000Z",
  "keys": { "apex.notes.v1": "[...]" }
}
```

Restore accepts this shape, or a bare `{ "key": "value" }` object. Keys without the `apex.` prefix
are ignored. Restoring asks for confirmation first and overwrites same-named keys.

## Bundling into ApexOS

Roster entry `Apex-Backup backup`. Keep paths relative and bump `CACHE` in `sw.js`
(`apex-backup-v1`) when shell files change.
