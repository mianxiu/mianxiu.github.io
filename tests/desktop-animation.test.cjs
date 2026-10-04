const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const triangleSource = fs.readFileSync(path.join(__dirname, '../js/motionGraphic.js'), 'utf8')
const playerSource = fs.readFileSync(path.join(__dirname, '../js/mp3Player.js'), 'utf8')

function eventTarget(extra = {}) {
    const listeners = new Map()
    return Object.assign({
        listeners,
        addEventListener(name, fn) {
            if (!listeners.has(name)) listeners.set(name, new Set())
            listeners.get(name).add(fn)
        },
        removeEventListener(name, fn) { listeners.get(name)?.delete(fn) },
        emit(name, event = {}) { for (const fn of [...(listeners.get(name) || [])]) fn(event) },
        count(name) { return listeners.get(name)?.size || 0 }
    }, extra)
}

function harness() {
    const frames = new Map(), observers = new Set()
    let id = 0, paints = 0
    const window = eventTarget()
    const body = { parentElement: null, clientWidth: 1280, clientHeight: 780 }
    const document = eventTarget({ hidden: false, body })
    const context = {
        clearRect() { paints++ }, beginPath() {}, moveTo() {}, lineTo() {},
        closePath() {}, stroke() {}, fill() {}, fillRect() {}
    }
    function element() {
        return {
            isConnected: true, visible: true, width: 500, height: 350,
            parentElement: body, style: {},
            getClientRects() { return this.visible ? [{}] : [] },
            getContext() { return context }
        }
    }
    const outline = element(), shadow = element(), visual = element(), progress = element()
    const label = { writes: 0, value: '', get textContent() { return this.value },
        set textContent(text) { this.value = text; this.writes++ } }
    const stylesheet = eventTarget()
    const nodes = { '#triangle': outline, '#gray': shadow, '#visual': visual, '#audioProgressA': progress, '#timePass': label, '#mp3CSS': stylesheet }
    document.querySelector = selector => nodes[selector]
    const sandbox = {
        document, window, Uint8Array,
        getRandom: a => a.map(x => x + .5),
        $: selector => nodes[selector],
        requestAnimationFrame(fn) { frames.set(++id, fn); return id },
        cancelAnimationFrame(id) { frames.delete(id) },
        MutationObserver: class {
            constructor(fn) { this.fn = fn; observers.add(this) }
            observe() {}
            disconnect() { observers.delete(this) }
        }
    }
    vm.createContext(sandbox)
    return {
        sandbox, frames, observers, document, window, outline, shadow, visual, progress, label, stylesheet,
        paints: () => paints,
        tick(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)) },
        mutate() { for (const observer of [...observers]) observer.fn() }
    }
}

// Repeated navigation must never retain old animation frames, observers or listeners.
const home = harness()
vm.runInContext(triangleSource, home.sandbox)
for (let i = 0; i < 100; i++) home.sandbox.triangle()
assert.equal(home.frames.size, 1)
assert.equal(home.window.count('mousemove'), 1)
assert.equal(home.document.count('visibilitychange'), 1)
assert.equal(home.observers.size, 1)
const initialPaints = home.paints()
home.tick(0)
home.tick(16)
home.tick(40)
assert.equal(home.paints() - initialPaints, 2, 'drift is capped at 30 paints/s')
home.window.emit('mousemove', { clientX: 800, clientY: 400 })
home.window.emit('mousemove', { clientX: 900, clientY: 420 })
assert.equal(home.outline.style.transform, undefined, 'pointer input is coalesced')
home.tick(56)
assert.equal(home.outline.style.transform, 'translate(-7.6000000000000005px,-1.8px)')
assert.equal(home.shadow.style.transform, 'translate(19px,7.2px)')
home.outline.visible = false
home.mutate()
assert.equal(home.frames.size, 0)
const hiddenPaints = home.paints()
home.tick(80)
home.window.emit('mousemove', { clientX: 100, clientY: 100 })
assert.equal(home.paints(), hiddenPaints)
home.outline.visible = true
home.mutate()
home.mutate()
assert.equal(home.frames.size, 1)
home.document.hidden = true
home.document.emit('visibilitychange')
assert.equal(home.frames.size, 0)
home.document.hidden = false
home.document.emit('visibilitychange')
assert.equal(home.frames.size, 1)
home.window.emit('pagehide')
assert.equal(home.frames.size, 0)
home.window.emit('pageshow')
assert.equal(home.frames.size, 1)
home.outline.isConnected = false
home.tick(100)
assert.equal(home.frames.size, 0)
assert.equal(home.window.count('mousemove'), 0)
assert.equal(home.document.count('visibilitychange'), 0)
assert.equal(home.observers.size, 0)

// Exercise the production scheduler and spectrum function with a paused media element.
const audio = harness()
const player = eventTarget({ paused: true, ended: false, error: null, duration: 120, currentTime: 1 })
let reads = 0
const analyser = { frequencyBinCount: 16, getByteFrequencyData(data) { reads++; data.fill(32) } }
audio.sandbox.player = player
audio.sandbox.analyser = analyser
vm.runInContext(playerSource.slice(0, playerSource.indexOf('function mp3Player()')), audio.sandbox)
function installFunction(name, endMarker) {
    const start = playerSource.indexOf('  function ' + name + '(')
    const end = playerSource.indexOf(endMarker, start)
    assert.ok(start >= 0 && end > start)
    vm.runInContext(playerSource.slice(start, end), audio.sandbox)
    audio.sandbox[name]()
}
installFunction('visual', '\n  visual();')
installFunction('AudioProgress', '\n  AudioProgress();')
assert.equal(audio.frames.size, 0, 'initial paused player has no continuous frames')
assert.equal(reads, 0, 'paused player must not analyse audio')
assert.equal(audio.label.textContent, '1:59')
player.paused = false
player.emit('play')
player.emit('play')
assert.equal(audio.frames.size, 2, 'one spectrum loop and one progress loop')
audio.tick(0)
const firstWrites = audio.label.writes
audio.tick(16)
assert.equal(reads, 1, 'spectrum is capped at 30 paints/s')
assert.equal(audio.label.writes, firstWrites, 'unchanged time label must not be rewritten')
player.currentTime = 2
audio.tick(40)
assert.equal(reads, 2)
assert.equal(audio.label.textContent, '1:58')
audio.document.hidden = true
audio.document.emit('visibilitychange')
assert.equal(audio.frames.size, 0)
audio.tick(100)
assert.equal(reads, 2)
audio.document.hidden = false
audio.document.emit('visibilitychange')
assert.equal(audio.frames.size, 2)
audio.visual.visible = audio.progress.visible = false
audio.mutate()
assert.equal(audio.frames.size, 0, 'archive/hidden player must stop both loops')
audio.visual.visible = audio.progress.visible = true
audio.mutate()
assert.equal(audio.frames.size, 2)
audio.window.emit('pagehide')
assert.equal(audio.frames.size, 0)
audio.window.emit('pageshow')
assert.equal(audio.frames.size, 2)
player.paused = true
player.emit('pause')
assert.equal(audio.frames.size, 0)
audio.document.emit('visibilitychange')
assert.equal(audio.frames.size, 0, 'visibility must not restart paused audio')
player.paused = false
player.emit('play')
player.ended = true
player.emit('ended')
assert.equal(audio.frames.size, 0)
player.ended = false
player.error = { code: 4 }
player.emit('error')
assert.equal(audio.frames.size, 0)
assert.equal(audio.label.textContent, 'error')
audio.visual.isConnected = audio.progress.isConnected = false
audio.mutate()
assert.equal(audio.observers.size, 0)
assert.equal(player.count('play'), 0)
assert.equal(audio.document.count('visibilitychange'), 0)
assert.equal(audio.stylesheet.count('load'), 0)
console.log('Desktop animations: single home loop, hidden/paused suspension, navigation cleanup, 30fps spectrum and deduplicated time labels passed.')
