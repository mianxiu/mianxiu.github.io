const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8')
const shared = read('js/loading.js')
let starts = 0, stops = 0, clears = 0
const classes = new Set()
const layer = {
    hidden: true, innerHTML: '',
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    querySelector: () => ({}), replaceChildren() { this.innerHTML = ''; clears++ }
}
const exitTimers = new Map()
let timerId = 0
const motion = { matches: false }
const context = {
    document: { querySelector: () => layer, hidden: false }, matchMedia: () => motion,
    setTimeout(callback, delay) { assert.equal(delay, 340); exitTimers.set(++timerId, callback); return timerId },
    clearTimeout(id) { exitTimers.delete(id) }
}
const finishExit = () => { const callbacks = [...exitTimers.values()]; exitTimers.clear(); callbacks.forEach(callback => callback()) }
vm.createContext(context)
vm.runInContext(shared, context)
context.animateSiteTriangle = () => { starts++; return () => { stops++ } }

const first = context.beginDesktopLoading()
const second = context.beginDesktopLoading()
assert.equal(layer.innerHTML, context.siteLoadingMarkup())
assert.ok(classes.has('is-loading'))
assert.equal(layer.hidden, false)
assert.equal(starts, 1, 'overlapping requests share one animation')
first()
first()
assert.equal(layer.hidden, false, 'one completion must not hide another pending request')
second()
second()
assert.equal(layer.hidden, false, 'keep the cover while its exit animates')
assert.ok(classes.has('is-leaving'))
assert.equal(exitTimers.size, 1)
assert.equal(stops, 1, 'stop continuous animation as soon as the request finishes')
finishExit()
assert.equal(layer.hidden, true)
assert.equal(stops, 1)
assert.equal(clears, 1)
assert.equal(classes.size, 0)
context.beginDesktopLoading()()
assert.equal(starts, 2)
assert.equal(stops, 2)
// Restarting during the exit must cancel the old hide timer and restore the cover.
const restarted = context.beginDesktopLoading()
assert.equal(exitTimers.size, 0)
assert.equal(classes.has('is-leaving'), false)
finishExit()
assert.equal(layer.hidden, false)
restarted()
finishExit()
assert.equal(layer.hidden, true)
motion.matches = true
context.beginDesktopLoading()()
assert.equal(layer.hidden, true, 'reduced motion skips the blur animation')
assert.equal(exitTimers.size, 0)
motion.matches = false
context.document.hidden = true
context.beginDesktopLoading()()
assert.equal(layer.hidden, true, 'hidden tabs clean up without waiting for an animation')
context.document.hidden = false

// Every XHR completion path must release its loader exactly once.
const indexSource = read('js/index.js')
const ajax = indexSource.slice(indexSource.indexOf('function ajax('), indexSource.indexOf('function navGetAjax('))
const requests = []
Object.assign(context, {
    console: { error() {} },
    XMLHttpRequest: class {
        constructor() { requests.push(this) }
        open() {}
        send() {}
    }
})
vm.runInContext(ajax, context)
for (const outcome of ['success', 'http-error', 'onerror', 'ontimeout', 'onabort']) {
    let callbackRuns = 0
    context.ajax('/context.html', () => { callbackRuns++ })
    const request = requests.at(-1)
    assert.equal(layer.hidden, false)
    if (outcome === 'success' || outcome === 'http-error') {
        request.status = outcome === 'success' ? 200 : 404
        request.onload()
        assert.equal(callbackRuns, outcome === 'success' ? 1 : 0)
    } else request[outcome]()
    assert.ok(classes.has('is-leaving'), outcome + ' must start exit')
    finishExit()
    assert.equal(layer.hidden, true, outcome + ' must remove the cover after exit')
}
context.XMLHttpRequest = class { open() {} send() { throw new Error('send failed') } }
assert.throws(() => context.ajax('/context.html', () => {}), /send failed/)
finishExit()
assert.equal(layer.hidden, true)
assert.equal(starts, stops)

// A standalone article must not show a late loader after a fast response/error.
function standaloneHarness(deferImageHelpers = false) {
    let request, script, starts = 0, stops = 0
    const scripts = []
    const nodes = { title: {}, '#essay-response': {}, '#essayClose': { style: {}, addEventListener() {} }, '#main': {} }
    const sandbox = {
        console: { error() {} }, decodeURI,
        location: { pathname: '/essay/2021/01/25/test/', href: 'http://localhost/essay/2021/01/25/test/' },
        window: { matchMedia: () => ({ matches: false, addEventListener() {} }) },
        document: {
            documentElement: {},
            querySelector: selector => nodes[selector], querySelectorAll: () => [],
            createElement: () => ({}), head: { append(el) { script = el; scripts.push(el) } }
        },
        hljs: { highlightBlock() {} }, mixxoPost: { init() {} },
        XMLHttpRequest: class { constructor() { request = this } open() {} send() {} }
    }
    if (!deferImageHelpers) sandbox.sanitizeSiteContentHTML = html => html
    sandbox.window.location = sandbox.location
    vm.runInNewContext(read('js/essay.js'), sandbox)
    return {
        request,
        loadScript() {
            sandbox.beginDesktopLoading = () => { starts++; return () => { stops++ } }
            script.onload()
        },
        loadImageHelpers() {
            sandbox.sanitizeSiteContentHTML = html => html.replace('<div class="_banner"></div>', '')
            scripts.find(el => el.src.includes('image-placeholders.js')).onload()
        },
        content: () => nodes['#essay-response'].innerHTML,
        counts: () => ({ starts, stops })
    }
}
for (const event of ['onload', 'onerror', 'ontimeout', 'onabort']) {
    const page = standaloneHarness()
    page.request.status = 200
    page.request.responseText = '<p>Article</p>'
    page.request[event]()
    page.loadScript()
    assert.deepEqual(page.counts(), { starts: 0, stops: 0 })
}
const slowPage = standaloneHarness()
slowPage.loadScript()
assert.deepEqual(slowPage.counts(), { starts: 1, stops: 0 })
slowPage.request.status = 200
slowPage.request.responseText = '<p>Article</p>'
slowPage.request.onload()
assert.deepEqual(slowPage.counts(), { starts: 1, stops: 1 })

// PC archive and standalone articles also use this same markup/animation.
assert.doesNotMatch(read('js/archive.js'), /Loading…/)
assert.match(read('js/archive.js'), /const finish = beginDesktopLoading\(\)/)
assert.match(read('js/archive.js'), /finally\s*\{\s*finish\(\)/)
assert.match(read('js/essay.js'), /if \(!settled\) stopLoading = beginDesktopLoading\(\)/)
assert.match(read('js/essay.js'), /oReq\.onerror = oReq\.ontimeout = oReq\.onabort = finish/)
assert.match(read('js/mobile-app.js'), /function mobileLoadingMarkup\(\)\s*\{\s*return siteLoadingMarkup\(\)/)
const index = read('index.html')
assert.ok(index.indexOf('/js/loading.js?') < index.indexOf('/js/mobile-app.js?'))
assert.match(read('css/loading.css'), /width: 96px/)
const loadingCSS = read('css/loading.css')
assert.match(loadingCSS, /@media \(min-width: 768px\)/)
assert.match(loadingCSS, /#ajaxProgress\.is-loading[^}]*position: fixed;[^}]*inset: 0;[^}]*width: 100%;[^}]*height: 100%;[^}]*background: #fff;[^}]*pointer-events: auto;/)
assert.match(loadingCSS, /#ajaxProgress \.m-loading\s*\{[^}]*min-height: 0;/)
assert.match(loadingCSS, /#ajaxProgress\.is-leaving[^}]*pointer-events: none;[^}]*animation: loading-cover-exit 320ms/)
assert.match(loadingCSS, /@keyframes loading-triangle-exit[^\n]*filter: blur\(8px\); opacity: 0;/)
assert.match(loadingCSS, /prefers-reduced-motion: reduce/)
assert.doesNotMatch(loadingCSS, /#ajaxProgress \.m-loading-triangle\s*\{[^}]*width: 100%/)
assert.match(loadingCSS, /--desktop-mini-height: \.78rem; --desktop-mini-bottom: \.10rem;/)
const miniCSS = read('css/mp3Player_min.css')
assert.match(miniCSS, /#foot\s*\{[^}]*top: auto;[^}]*transform: none;[^}]*height: var\(--desktop-mini-height, \.78rem\);[^}]*bottom: var\(--desktop-mini-bottom, \.10rem\);/)
assert.doesNotMatch(miniCSS, /translateY\(680px\)/)
assert.match(indexSource, /mp3Player_min\.css\?v=\d{8}-\d{2}/)
assert.match(read('css/1366.css'), /@import url\('\.\/loading\.css\?v=/)
assert.match(read('css/1366.scss'), /@import url\('\.\/loading\.css\?v=/)
console.log('Shared loader: centered desktop white cover, blur exit, restart cancellation, reduced motion, concurrent requests and error cleanup passed.')
;(async () => {
    const page = standaloneHarness(true)
    page.request.status = 200
    page.request.responseText = '<div class="_banner"></div><p>Article</p>'
    const rendered = page.request.onload()
    assert.equal(page.content(), undefined, 'a fast response must wait for pre-render image cleanup')
    page.loadImageHelpers()
    await rendered
    assert.equal(page.content(), '<p>Article</p>')
    page.loadScript()
    assert.deepEqual(page.counts(), { starts: 0, stops: 0 })
    console.log('Standalone fast response waits for image-slot cleanup without showing a late loader.')
})().catch(error => { console.error(error); process.exitCode = 1 })
