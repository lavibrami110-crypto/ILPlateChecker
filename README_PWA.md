Quick PWA deploy (fastest way to run on iPhone)

1) Initialize a Git repo and push to GitHub (create a new repository on GitHub first):

```bash
git init
git add .
git commit -m "IL Plate Checker - PWA"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

2) Enable GitHub Pages from the repository settings: select the `main` branch and `/ (root)` as the source.

3) Wait a minute, then open the GitHub Pages URL (https://<your-username>.github.io/<repo>/) on your iPhone Safari.

4) In Safari, open the Share menu and tap "Add to Home Screen". The app will appear like a native app.

Notes and tips
- If you want HTTPS-only API requests, host your Python API separately and update `config.json` with the `apiEndpoint`.
- App Store distribution requires building a native wrapper (Capacitor/ Xcode) and Apple Developer account.
- The service worker caches assets for offline use; to update the site, re-deploy to GitHub.
