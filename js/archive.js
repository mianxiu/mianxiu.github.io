// Desktop archive uses the same published indexes as the mobile archive.
function initDesktopArchive() {
    const panel = document.createElement('section')
    panel.id = 'desktopArchive'
    panel.hidden = true
    panel.setAttribute('aria-label', 'Archive')
    document.body.append(panel)
    let cachedPosts, revision = 0
    const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
    async function read(url) {
        const response = await fetch(url)
        if (!response.ok) throw new Error('Archive request failed: ' + url)
        return new DOMParser().parseFromString(await response.text(), 'text/html')
    }
    async function posts() {
        if (cachedPosts) return cachedPosts
        const docs = await Promise.all(['/essay/index.html', ...Array.from({ length: 9 }, (_, i) => '/essay/pages/' + (i + 1) + '/index.html'), '/gallery/index.html'].map(read))
        const items = docs.flatMap(doc => Array.from(doc.querySelectorAll('#essayLeft > ul > li, body > li')).flatMap(item => {
            const title = item.querySelector('.essay-title')?.textContent.trim()
            const timestamp = Date.parse(item.querySelector('._date')?.textContent.trim())
            if (!title || !Number.isFinite(timestamp)) return []
            const date = new Date(timestamp)
            const path = 'essay/' + [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0'), title].join('/')
            return [{ title, timestamp, href: '/' + path + '/' }]
        }))
        docs.at(-1).querySelectorAll('.gallery-link').forEach(item => {
            const path = item.dataset.href
            const match = path?.match(/^gallery\/(\d{4})\/(\d{2})\/(\d{2})\//)
            if (!match) return
            items.push({ title: item.querySelector('.gallery-title').textContent.trim(), timestamp: new Date(+match[1], +match[2] - 1, +match[3]).getTime(), href: '/#gallery=' + encodeURIComponent(path) })
        })
        cachedPosts = [...new Map(items.map(post => [post.href, post])).values()].sort((a, b) => b.timestamp - a.timestamp)
        return cachedPosts
    }
    async function update() {
        const id = ++revision
        const active = location.hash === '#archive'
        panel.hidden = !active
        document.body.classList.toggle('desktop-archive-open', active)
        if (!active) return
        panel.scrollTop = 0
        const header = '<header><button class="archive-heading" data-archive-close aria-label="返回首页">Archive</button></header>'
        panel.innerHTML = header + '<p role="status">Loading…</p>'
        try {
            const all = await posts()
            if (id !== revision) return
            const years = [...new Set(all.map(post => new Date(post.timestamp).getFullYear()))]
            panel.innerHTML = header + '<main>' + years.map((year, i) => '<details ' + (i < 2 ? 'open' : '') + '><summary>' + year + '<img src="/assets/mobile/more.svg" alt=""></summary><ul>' + all.filter(post => new Date(post.timestamp).getFullYear() === year).map(post => '<li><a href="' + escape(post.href) + '">' + escape(post.title) + '</a><time>' + new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() + '</time></li>').join('') + '</ul></details>').join('') + '</main>'
        } catch (error) {
            if (id === revision) panel.innerHTML = header + '<p>归档加载失败，请刷新重试。</p>'
            console.error(error)
        }
    }
    panel.addEventListener('click', event => {
        if (event.target.closest('[data-archive-close]')) {
            document.querySelector('#logo_other').click()
            update()
        }
        const gallery = event.target.closest('a[href^="/#gallery="]')
        if (gallery) {
            event.preventDefault()
            history.pushState(null, '', gallery.getAttribute('href'))
            update()
            restoreRoute()
        }
    })
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    update()
}

document.addEventListener('DOMContentLoaded', () => {
    if (!matchMedia('(max-width: 767px)').matches) initDesktopArchive()
})
