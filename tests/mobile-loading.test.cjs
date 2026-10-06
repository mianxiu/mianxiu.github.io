const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/mobile-app.js'), 'utf8')
const sharedSource = fs.readFileSync(require('node:path').join(__dirname, '../js/loading.js'), 'utf8')

// Exercise the same animation used by home and loading without browser motion preferences.
function animationHarness(reducedMotion = false, interactive = false) {
    const frames = new Map(), documentListeners = new Map(), motionListeners = new Map(), pointerListeners = new Map()
    let frameId = 0
    const shape = attributes => ({
        attributes: { ...attributes },
        getAttribute(name) { return this.attributes[name] ?? null },
        setAttribute(name, value) { this.attributes[name] = value },
        removeAttribute(name) { delete this.attributes[name] }
    })
    const outline = shape({ d: 'M66.9929 216.027L0.992927 1.52683L247.493 216.027H66.9929Z' })
    const shadow = shape({ fill: '#F3F3F3' })
    const svg = {
        querySelectorAll() { return [] },
        setAttribute() {},
        querySelector(selector) { return selector === 'path[stroke]' ? outline : shadow }
    }
    const home = {
        addEventListener(name, callback) { pointerListeners.set(name, callback) },
        removeEventListener(name) { pointerListeners.delete(name) },
        getBoundingClientRect() { return { left: 0, top: 0, width: 375, height: 640 } }
    }
    const holder = {
        isConnected: true,
        querySelector() { return svg },
        replaceChildren(child) { assert.equal(child, svg) },
        closest() { return home }
    }
    const motion = {
        matches: reducedMotion,
        addEventListener(name, callback) { motionListeners.set(name, callback) },
        removeEventListener(name) { motionListeners.delete(name) }
    }
    const document = {
        hidden: false,
        addEventListener(name, callback) { documentListeners.set(name, callback) },
        removeEventListener(name) { documentListeners.delete(name) }
    }
    const deterministicMath = Object.create(Math)
    deterministicMath.random = () => 0.75
    const sandbox = {
        root: { querySelector() { return holder } }, document,
        Math: deterministicMath, matchMedia: () => motion, console,
        requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId },
        cancelAnimationFrame(id) { frames.delete(id) }, stopTriangle() {},
        load() { throw new Error('Inline loader must not fetch an asset') }
    }
    vm.createContext(sandbox)
    vm.runInContext(sharedSource, sandbox)
    vm.runInContext(source.slice(0, source.indexOf('async function initMobileApp()')), sandbox)
    const start = source.indexOf('    async function animateTriangle(')
    const end = source.indexOf('\n    function menu()', start)
    assert.ok(start >= 0 && end > start)
    vm.runInContext(source.slice(start, end), sandbox)
    return {
        frames, documentListeners, motionListeners, pointerListeners, outline, shadow, holder, motion, document, sandbox,
        start: () => sandbox.animateTriangle(holder, interactive),
        tick(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)) }
    }
}

;(async () => {
    const loading = animationHarness()
    await loading.start()
    const original = loading.outline.getAttribute('d')
    assert.equal(loading.frames.size, 1)
    loading.tick(16)
    assert.notEqual(loading.outline.getAttribute('d'), original)
    const shadowTransform = loading.shadow.getAttribute('transform')
    assert.notEqual(shadowTransform, 'translate(0 0)')
    loading.tick(32)
    assert.notEqual(loading.shadow.getAttribute('transform'), shadowTransform)
    assert.equal(loading.pointerListeners.size, 0)
    loading.document.hidden = true
    loading.documentListeners.get('visibilitychange')()
    assert.equal(loading.frames.size, 0)
    loading.document.hidden = false
    loading.documentListeners.get('visibilitychange')()
    assert.equal(loading.frames.size, 1)
    loading.motion.matches = true
    loading.motionListeners.get('change')()
    assert.equal(loading.frames.size, 0)
    assert.equal(loading.shadow.getAttribute('transform'), null)
    loading.motion.matches = false
    loading.motionListeners.get('change')()
    assert.equal(loading.frames.size, 1)
    loading.holder.isConnected = false
    loading.tick(48)
    assert.equal(loading.frames.size, 0)
    loading.sandbox.stopTriangle()
    assert.equal(loading.documentListeners.size, 0)
    assert.equal(loading.motionListeners.size, 0)

    const reduced = animationHarness(true)
    await reduced.start()
    assert.equal(reduced.frames.size, 0)
    assert.equal(reduced.shadow.getAttribute('transform'), null)
    reduced.sandbox.stopTriangle()

    const home = animationHarness(false, true)
    await home.start()
    assert.equal(home.pointerListeners.size, 3)
    home.tick(16)
    assert.equal(home.shadow.getAttribute('transform'), 'translate(0 0)')
    home.sandbox.stopTriangle()
    assert.equal(home.frames.size, 0)
    assert.equal(home.pointerListeners.size, 0)
    console.log('Loading/home animation: both loader triangles move; reduced motion, visibility, removal and listener cleanup passed.')
})().catch(error => { console.error(error); process.exitCode = 1 })
