# ToolBox: installable app (PWA)

Works on iPhone, iPad, Android, Windows and Mac. Needs to be hosted over HTTPS once; after that it installs like a normal app and works offline.

## 1. Host the folder (free, ~2 minutes)
Upload this whole folder to any static host with HTTPS, for example:
- Netlify Drop: drag the folder onto https://app.netlify.com/drop
- Cloudflare Pages, GitHub Pages, or Vercel

Opening index.html straight from your disk will NOT install, because browsers only allow installs from https:// (or localhost).

## 2. Install
- iPhone / iPad: open the link in Safari, tap Share, then "Add to Home Screen".
- Android: open in Chrome, tap "Install" in the page (or menu, then "Install app").
- Windows: open in Edge or Chrome, click the Install icon in the address bar (or the "Install" button in the page).
- Mac: Chrome/Edge: same install icon. Safari (Sonoma or later): File, then "Add to Dock".

## Updating
After editing any file, change VERSION in sw.js (for example toolbox-v2) and re-upload. Installed apps pick it up next time they open online.

## Notes
- All Claude/AI features are hidden in the installed app (they only work inside Claude). Everything else works.
- The QR library and fonts are downloaded on first online visit and then cached for offline use.
