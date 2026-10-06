const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const read = path => fs.readFileSync(path, 'utf8')
const title = '性能强劲的电脑 70%-90%完全体'
for (const path of ['essay/index.html', 'essay/pages/1/index.html']) {
    const card = read(path).match(/<li>[\s\S]*?<\/li>/g).find(card => card.includes(title))
    assert.ok(card)
    assert.doesNotMatch(card, /preview|<img|background-image/)
    assert.match(card, /class="summary"><p>终于把机子装了。<\/p>/)
    assert.match(card, /Apr 4, 2021/)
}
const article = read('essay/2021/04/04/' + title + '/context.html')
assert.doesNotMatch(article, /_banner|\/essay\/\.png/)
assert.match(article, /终于把机子装了。/)
const mobile = read('js/mobile-app.js')
const start = mobile.indexOf('    function listEssays(posts) {')
const end = mobile.indexOf('\n    function listGallery()', start)
const sandbox = { state: { page: 1 }, header: () => '', icon: () => '', routeFor: () => '', escape: value => value, dateText: () => 'APR 4, 2021' }
vm.runInNewContext(mobile.slice(start, end), sandbox)
const html = sandbox.listEssays([{ title, summary: '终于把机子装了。', timestamp: Date.parse('2021-04-04') }])
assert.doesNotMatch(html, /class="m-preview"/)
assert.match(html, /m-summary"><p>终于把机子装了。/)
assert.match(mobile, /fetch\(url, \{ cache: 'no-cache' \}\)/)
const desktop = read('js/index.js')
const ajax = desktop.slice(desktop.indexOf('function ajax('), desktop.indexOf('function navGetAjax('))
const requests = []
const context = { XMLHttpRequest: class { open(method, url) { requests.push(url) } send() {} }, beginDesktopLoading: () => () => {} }
vm.runInNewContext(ajax, context)
context.ajax('/essay/index.html', () => {})
context.ajax('/essay/index.html?existing=1', () => {})
assert.match(requests[0], /^\/essay\/index\.html\?v=\d{8}-\d{2}$/)
assert.match(requests[1], /^\/essay\/index\.html\?existing=1&v=\d{8}-\d{2}$/)
const content = read('js/content.js')
const routeContext = {}
vm.runInNewContext(content.match(/function desktopEssayPath\([\s\S]*?\n\}/)[0], routeContext)
for (const name of [title, 'literal %25', 'title #hash?query&value', '中文 空格']) {
    const url = new URL(routeContext.desktopEssayPath('2021/04/04', name), 'https://mianxiu.me/')
    assert.equal(decodeURIComponent(url.pathname), '/essay/2021/04/04/' + name + '/')
    assert.equal(url.hash, '')
    assert.equal(url.search, '')
    assert.doesNotThrow(() => decodeURI(url.pathname))
}
assert.match(content, /ajax\(path \+ 'context\.html', writeEssay\)/)
assert.match(content, /history\.pushState\(state, ePostH1, path\)/)
console.log('Missing PC/mobile preview: text-only card/article, no error-removal jump, refreshed HTML and percent-safe PC article routes passed.')
