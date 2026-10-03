# User-requested release workflow

- Automatically commit and push completed, verified site changes to GitHub, as requested by the user. Preserve unrelated changes.
- Until the user explicitly asks to remove it, update the version information in `about/index.html` for every site update and report that version in the final reply.
- Use an increasing release identifier (`YYYYMMDD-NN`). Keep the mobile CSS and JS query-string versions in `index.html` equal to the About release version. The mobile About view also displays the resource versions referenced by the current page for cache diagnosis.
- Do not claim that desktop browser responsive testing verifies iOS Safari's native status-bar or toolbar blur; it requires matching iOS Simulator or real-device testing.
