# User-requested release workflow

- Automatically commit and push completed, verified site changes to GitHub, as requested by the user. Preserve unrelated changes.
- The user has ended the temporary About diagnostics: do not add release information, resource versions, update notes, or diagnostic links to About unless explicitly requested again. Routine final replies no longer need to report a release identifier.
- Keep mobile CSS and JS cache-busting query-string versions in `index.html` synchronized and advance them when publishing resource changes; these versions are internal, not displayed in About.
- Do not claim that desktop browser responsive testing verifies iOS Safari's native status-bar or toolbar blur; it requires matching iOS Simulator or real-device testing.
