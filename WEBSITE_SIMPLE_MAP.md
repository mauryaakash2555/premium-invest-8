# 🧒 Website Map (Kid-Simple)

If you think of the website like a **shopping mall**:
- `app/` = all the **rooms** (pages)
- `components/` = reusable **furniture** (buttons, cards, overlays)
- `lib/` + `utils/` = **tools** (helpers)
- `public/` = **posters & images**
- `backup/` = **spare keys** (recovery copies)

---

## 1) The BIG picture (diagram)

```text
premium-invest-8 (the whole project)
|
|-- app/                 (PAGES / ROOMS)
|    |-- layout.js        (common wrapper)
|    |-- page.js          (home page)
|    |-- api/             (server endpoints)
|    |-- live-intelligence/
|         |-- page.jsx    (live intelligence page)
|
|-- components/          (UI pieces / furniture)
|    |-- user/            (big UI pieces used across pages)
|    |    |-- LiveIntelligenceOverlay.jsx  (the overlay)
|    |-- live-intelligence/ (small modules inside the overlay)
|         |-- TodayIntelPanel.tsx
|         |-- SmartAlertsPanel.tsx
|         |-- AskIntelligencePanel.tsx
|
|-- lib/                 (helpers)
|-- utils/               (helpers)
|-- public/              (images, icons)
|-- backup/              (recovery copies)
|-- .tools/              (scripts to help you)
```

---

## 2) How the Live Intelligence overlay is built

```text
User opens Live Intelligence
        |
        v
LiveIntelligenceOverlay.jsx (main screen)
        |
        +--> shows modules (panels)
              |
              +--> Market modules (deep dive)
              +--> For-you modules (personalized actions)
```

---

## 3) Backups: the 2 safety nets (super simple)

### Safety Net A — “LOCKED FOLDER” (spare key)
Location:
- `backup/live-intelligence-locked-2026-01-28/`

What it does:
- Keeps a copy of the most important Live Intelligence files.

### Safety Net B — “ZIP SNAPSHOT” (photo of the whole project)
Script:
- `.tools/backup-site.ps1`

What it does:
- Creates `backup/site-snapshots/.../repo.zip`
- This zip is made from Git, so it’s clean and safe.

---

## 4) If something breaks (flow chart)

```text
START
  |
  v
Is the problem only Live Intelligence?
  |
  +-- YES --> Restore the locked LI files -> run dev -> done
  |
  +-- NO  --> Use the zip snapshot -> unzip -> npm install -> run -> done
```

---

## 4.1) Safety rules (so we don’t lie by mistake)

```text
Rule 1: Never show fake “portfolio holdings” or fake “live P&L”.
Rule 2: If data is missing, show “—” or “not available”.
Rule 3: “Education / explanation” is OK. “Advice / recommendation” is NOT.
Rule 4: If unsure, keep it simple and truthful.
```

---

## 4.2) How to edit safely (tiny checklist)

```text
Before editing big files:
  1) Run the backup script (makes a zip)
  2) Make your change
  3) Run the website (npm run dev)
  4) If broken: restore from the locked folder
```

---

## 5) The 3 commands you need (copy/paste)

### Make a full website zip backup
```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .tools\backup-site.ps1 -Name "locked_2026-01-28"
```

### Restore Live Intelligence overlay (fast)
```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -Command "Copy-Item 'backup\live-intelligence-locked-2026-01-28\LiveIntelligenceOverlay.jsx' 'components\user\' -Force"
```

### Run the website
```powershell
npm run dev
```
