const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const context = {}
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../js/mobile-app.js'), 'utf8'), context)
const metrics = context.mobileViewportMetrics
const expanded = metrics({ scale: 1, height: 640, offsetTop: 0 }, 812, 44, 34)
const collapsed = metrics({ scale: 1, height: 760, offsetTop: 0 }, 812, 44, 34)
assert.equal(expanded.height, 640)
assert.equal(collapsed.height, 760)
assert.ok(expanded.homeScale < collapsed.homeScale)
for (const height of [320, 480, 568, 640, 812]) {
    const result = metrics({ scale: 1, height, offsetTop: 0 }, 812, 44, 34)
    assert.ok(result.homeScale * 640 + 44 + 34 + 40 <= height + 0.001)
}
assert.equal(metrics({ scale: 1, height: 360, offsetTop: 150 }, 812).top, 150)
assert.equal(metrics({ scale: 2, height: 320, offsetTop: 80 }, 812).height, 812)
assert.equal(metrics(null, 568).height, 568)
assert.equal(metrics({ scale: 1, height: 900, offsetTop: 0 }, 900).homeScale, 1)
const points = [0, 100, 200]
const target = [4, 96, 204]
context.mobileTriangleStep(points, target, 16)
assert.ok(points[0] > 0 && points[0] < 4)
assert.ok(points[1] < 100 && points[1] > 96)
for (let frame = 0; frame < 240; frame++) context.mobileTriangleStep(points, target, 16)
assert.ok(Math.abs(points[0] - 4) < 0.1)
assert.ok(Math.abs(points[1] - 96) < 0.1)
console.log('Mobile layout: toolbar, safe areas, keyboard, zoom, fallback and smooth triangle interpolation passed.')
