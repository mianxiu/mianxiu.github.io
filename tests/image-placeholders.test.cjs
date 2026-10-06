const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const source = fs.readFileSync('js/image-placeholders.js', 'utf8')
const manifest = JSON.parse(fs.readFileSync('assets/image-placeholders.json', 'utf8'))
assert.ok(Object.keys(manifest).length >= 75)
for (const preview of Object.values(manifest)) {
    assert.ok(preview.width > 0 && preview.height > 0)
    const svg = Buffer.from(preview.preview.split(',')[1], 'base64').toString()
    assert.ok(svg.includes('width="' + preview.width + '"'))
    assert.match(svg, /href="data:image\/jpeg;base64,/)
    assert.doesNotMatch(svg, /<filter|feGaussianBlur/, 'the blur must be baked, not a live filter')
}
const generator = fs.readFileSync('scripts/build-image-placeholders.py', 'utf8')
assert.match(generator, /Image\.Resampling\.BICUBIC/)
assert.match(generator, /ImageFilter\.GaussianBlur\(radius=12\)/)
assert.doesNotMatch(generator, /Resampling\.NEAREST/)
const fullURL = 'https://img.mianxiu.me/image/essay/70cef56996b5e212b03288816cac5cb64ddba8a1.jpg'
const preview = manifest[fullURL].preview
const flush = () => new Promise(resolve => setImmediate(resolve))
function node(img, original, options = {}) {
    const attrs = { src: original }
    return {
        nodeType: 1, tagName: img ? 'IMG' : 'DIV', isConnected: true,
        complete: false, naturalWidth: 0, loading: '', style: { backgroundImage: original },
        getAttribute: name => attrs[name], setAttribute: (name, value) => { attrs[name] = value },
        hasAttribute: name => name in attrs, matches: () => true, querySelectorAll: () => [], ...options
    }
}
async function harness(nodes) {
    let observer, lazy
    const requests = []
    let fetches = 0
    const sandbox = {
        URL, location: { origin: 'https://mianxiu.me' }, console,
        fetch: async () => { fetches++; return { ok: true, json: async () => manifest } },
        document: { readyState: 'complete', baseURI: 'https://mianxiu.me/', body: { nodeType: 1, matches: () => false, querySelectorAll: () => nodes } },
        MutationObserver: class { constructor(callback) { observer = callback } observe() {} },
        IntersectionObserver: class { constructor(callback) { lazy = callback } observe() {} unobserve() {} },
        Image: class { constructor() { this.complete = false; this.naturalWidth = 0; requests.push(this) } async decode() {} removeAttribute() { this.cancelled = true } }
    }
    vm.runInNewContext(source, sandbox)
    await flush()
    return { requests, changed: el => observer([{ type: 'attributes', target: el }]), added: el => observer([{ type: 'childList', addedNodes: [el], removedNodes: [] }]), removed: el => observer([{ type: 'childList', addedNodes: [], removedNodes: [el] }]), visible: el => lazy([{ target: el, isIntersecting: true }]), fetches: () => fetches }
}
;(async () => {
    const banner = node(false, 'url("' + fullURL + '")')
    const img = node(true, fullURL)
    const cached = node(true, fullURL, { complete: true, naturalWidth: 1200 })
    const lazyImg = node(true, fullURL, { loading: 'lazy' })
    const unknown = node(true, 'https://other.example/image.jpg')
    const test = await harness([banner, img, cached, lazyImg, unknown])
    assert.equal(test.fetches(), 1, 'all content shares one manifest request')
    assert.equal(test.requests.length, 2, 'cached/lazy/unknown images must not eagerly load again')
    assert.equal(banner.style.backgroundImage, 'url("' + preview + '")')
    assert.equal(img.getAttribute('src'), preview)
    assert.equal(cached.getAttribute('src'), fullURL)
    assert.equal(lazyImg.getAttribute('src'), preview)
    assert.equal(unknown.getAttribute('src'), 'https://other.example/image.jpg')
    test.changed(img); test.changed(banner); await flush()
    assert.equal(test.requests.length, 2, 'our own mutations must not create a request loop')
    await test.requests[0].onload(); await flush()
    assert.equal(banner.style.backgroundImage, 'url("' + fullURL + '")')
    assert.equal(banner.getAttribute('data-mosaic-state'), 'loaded')
    await test.requests[1].onerror()
    assert.equal(img.getAttribute('src'), preview, 'failed originals keep a valid preview')
    assert.equal(img.getAttribute('data-mosaic-state'), 'error')
    test.visible(lazyImg)
    assert.equal(test.requests.length, 3)
    const staleLoad = test.requests[2].onload
    lazyImg.setAttribute('src', 'https://other.example/new.jpg')
    test.changed(lazyImg); await flush()
    assert.equal(test.requests[2].cancelled, true)
    await staleLoad(); await flush()
    assert.equal(lazyImg.getAttribute('src'), 'https://other.example/new.jpg', 'stale completion must not overwrite new source')
    const added = node(true, fullURL)
    test.added(added); await flush()
    assert.equal(added.getAttribute('src'), preview, 'AJAX/mobile route insertion is covered')
    added.isConnected = false
    test.removed(added)
    assert.equal(test.requests[3].cancelled, true)
    assert.equal(test.requests[3].onload, null)
    assert.equal(added.getAttribute('src'), preview, 'removed route stays untouched')
    assert.match(fs.readFileSync('index.html', 'utf8'), /defer src="\/js\/image-placeholders\.js\?v=/)
    assert.match(fs.readFileSync('js/essay.js', 'utf8'), /mosaics\.src = '\/js\/image-placeholders\.js\?v=/)
    console.log('Frosted source previews: baked blur, dimensions, shared manifest, load/error/cache/lazy, observer loops, new sources and removed routes passed.')
})().catch(error => { console.error(error); process.exitCode = 1 })
