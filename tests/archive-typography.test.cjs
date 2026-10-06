const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8')
const archive = read('css/archive.css')
const desktop = read('css/1366.css')
function rule(source, selector) {
    const escaped = selector.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const match = source.match(new RegExp('(?:^|\\n)\\s*' + escaped + '\\s*\\{([^}]+)\\}'))
    assert.ok(match, selector + ' rule must exist')
    return match[1]
}
function fontSize(body) {
    const match = body.match(/font-size:\s*([\d.]+)(rem|px)/)
    assert.ok(match)
    return { value: Number(match[1]), unit: match[2] }
}
const title = fontSize(rule(desktop, '.essay-title'))
const date = fontSize(rule(desktop, '._date, ._tags, ._updated'))
for (const selector of ['#desktopArchive .archive-heading', '#desktopArchive summary']) {
    assert.deepEqual(fontSize(rule(archive, selector)), title)
}
assert.deepEqual(fontSize(rule(archive, '#desktopArchive time')), date)
assert.deepEqual(fontSize(rule(archive, '#desktopArchive a')), { value: .18, unit: 'rem' })
assert.match(rule(archive, '#desktopArchive li'), /line-height: .30rem;/)
assert.match(rule(archive, '#desktopArchive time'), /white-space: nowrap;/)
assert.match(rule(archive, '#desktopArchive a'), /min-width: 0;[^}]*overflow-wrap: anywhere;/)
assert.match(rule(archive, '#desktopArchive summary img'), /width: .14rem; height: .14rem;/)
assert.equal(title.unit, 'rem')
assert.equal(date.unit, 'rem')
const index = read('index.html')
assert.match(index, /href="\/css\/archive\.css\?v=\d{8}-\d{2}" media="\(min-width: 768px\)"/)
assert.match(read('css/mobile.css'), /\.m-archive summary[^}]*font-size: 18px;/)
assert.match(read('css/mobile.css'), /\.m-archive time[^}]*font-size: 10px;/)
assert.deepEqual(fontSize(rule(read('css/mobile.css'), '.m-archive li a')), fontSize(rule(read('css/mobile.css'), '.m-archive time')))
console.log('Desktop Archive article titles use an 18px rem baseline; dates, mobile typography, headings, icons and spacing stay unchanged.')
