# First mobile release: iOS comparison fixture

This temporary diagnostic page restores the mobile app, index script, mobile CSS,
desktop base CSS and HTML shell from commit `9f584a9`. Only resource URLs,
favicon URL and the initial document title are adjusted for the diagnostic path.
Relative imports and icon URLs in the copied desktop CSS are resolved against
the original `/css/` location, not the diagnostic directory.
The first release's top gap, fixed article toolbar and default viewport are
deliberately retained so that this is a baseline, not a proposed fix.

Content, icons, comment service and other script dependencies remain shared with
the current site. No new comment submission or external test service is needed.

Open the fixture directly on the same iPhone and Safari version as the live site.
Compare scrolling near both browser edges. A desktop responsive screenshot cannot
confirm iOS browser-chrome behavior. Remove this fixture when diagnosis is finished.
