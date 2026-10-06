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
const context = { document: { querySelector: () => layer } }
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
assert.equal(layer.hidden, true)
assert.equal(stops, 1)
assert.equal(clears, 1)
assert.equal(classes.size, 0)
context.beginDesktopLoading()()
assert.equal(starts, 2)
assert.equal(stops, 2)

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
    assert.equal(layer.hidden, true, outcome + ' must stop loading')
}
context.XMLHttpRequest = class { open() {} send() { throw new Error('send failed') } }
assert.throws(() => context.ajax('/context.html', () => {}), /send failed/)
assert.equal(layer.hidden, true)
assert.equal(starts, stops)

// A standalone article must not show a late loader after a fast response/error.
function standaloneHarness() {
    let request, script, starts = 0, stops = 0
    const nodes = { title: {}, '#essay-response': {}, '#essayClose': { style: {}, addEventListener() {} }, '#main': {} }
    const sandbox = {
        console: { error() {} }, decodeURI,
        location: { pathname: '/essay/2021/01/25/test/', href: 'http://localhost/essay/2021/01/25/test/' },
        window: { matchMedia: () => ({ matches: false, addEventListener() {} }) },
        document: {
            documentElement: {},
            querySelector: selector => nodes[selector], querySelectorAll: () => [],
            createElement: () => ({}), head: { append(el) { script = el } }
        },
        hljs: { highlightBlock() {} }, mixxoPost: { init() {} },
        XMLHttpRequest: class { constructor() { request = this } open() {} send() {} }
    }
    sandbox.window.location = sandbox.location
    vm.runInNewContext(read('js/essay.js'), sandbox)
    return {
        request,
        loadScript() {
            sandbox.beginDesktopLoading = () => { starts++; return () => { stops++ } }
            script.onload()
        },
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
assert.match(read('css/loading.css'), /#ajaxProgress\.is-loading[^}]*background: #fff/)
assert.match(read('css/1366.css'), /@import url\('\.\/loading\.css\?v=/)
assert.match(read('css/1366.scss'), /@import url\('\.\/loading\.css\?v=/)
console.log('Shared desktop/mobile loader: identical markup, concurrent requests, success/error/timeout/abort cleanup and archive/standalone integration passed.')
