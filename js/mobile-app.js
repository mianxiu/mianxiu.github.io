/* Mobile views from the Figma design, backed by the site's existing content. */
function mobileViewportMetrics(viewport, layoutHeight, safeTop = 0, safeBottom = 0) {
    // Pinch zoom is not a browser-toolbar resize: keep the layout zoomable.
    const unzoomed = viewport && Math.abs(viewport.scale - 1) < 0.01
    const height = Math.max(1, unzoomed ? viewport.height : layoutHeight)
    return {
        height,
        homeScale: Math.min(1, Math.max(0.1, (height - safeTop - safeBottom - 40) / 640))
    }
}

function mobileTriangleStep(current, target, delta) {
    const amount = 1 - Math.exp(-Math.max(0, Math.min(delta, 64)) / 900)
    current.forEach((value, i) => { current[i] = value + (target[i] - value) * amount })
    return current
}

function mobileRouteForLocation(pageLocation) {
    let route = pageLocation.hash.slice(1)
    if (!route && pageLocation.pathname.startsWith('/essay/')) {
        route = 'essay=' + encodeURIComponent(decodeURI(pageLocation.pathname).replace(/^\//, '').replace(/\/$/, ''))
    }
    return route
}

async function initMobileApp() {
    const root = document.createElement('div')
    root.id = 'mobileApp'
    document.body.append(root)
    const cache = new Map()
    const state = { essays: [], galleries: [], page: 1, commentsOpen: false, renderId: 0 }
    let stopTriangle = () => {}
    let viewportFrame = 0
    function syncViewport() {
        // Only the home composition fits the viewport; the document shell stays untouched.
        const home = root.querySelector('.m-home')
        if (!home) return
        const homeStyle = getComputedStyle(home)
        const metrics = mobileViewportMetrics(window.visualViewport, window.innerHeight,
            parseFloat(homeStyle?.paddingTop) || 0, parseFloat(homeStyle?.paddingBottom) || 0)
        home.style.setProperty('--m-home-height', metrics.height + 'px')
        home.style.setProperty('--m-home-scale', metrics.homeScale)
    }
    function scheduleViewport() {
        if (viewportFrame) return
        viewportFrame = requestAnimationFrame(() => { viewportFrame = 0; syncViewport() })
    }
    window.addEventListener('resize', scheduleViewport, { passive: true })
    window.visualViewport?.addEventListener('resize', scheduleViewport, { passive: true })
    syncViewport()
    const asset = name => '/assets/mobile/' + name
    const escape = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
    const icon = (name, cls = '') => '<img class="' + cls + '" src="' + asset(name) + '" alt="">'
    const socialIcon = (circle, parts) => icon(circle) + parts.map(src => '<img class="m-social-glyph" src="/icon/' + src + '" alt="">').join('')
    const dateText = timestamp => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    const go = route => {
        if (location.pathname !== '/') {
            history.pushState(null, '', '/' + route)
            render()
        } else if (location.hash === route) render()
        else location.hash = route
    }
    const routeFor = post => '#' + post.type + '=' + encodeURIComponent(post.path)

    async function load(url) {
        if (!cache.has(url)) cache.set(url, fetch(url).then(response => {
            if (!response.ok) throw new Error('Unable to load ' + url)
            return response.text()
        }).catch(error => { cache.delete(url); throw error }))
        return new DOMParser().parseFromString(await cache.get(url), 'text/html')
    }

    function readEssays(doc) {
        return Array.from(doc.querySelectorAll('#essayLeft > ul > li, body > li')).flatMap(item => {
            const title = item.querySelector('.essay-title')?.textContent.trim()
            const timestamp = Date.parse(item.querySelector('._date')?.textContent.trim())
            if (!title || !Number.isFinite(timestamp)) return []
            const d = new Date(timestamp)
            const path = 'essay/' + [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0'), title].join('/')
            const image = item.querySelector('.preview-img')?.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]
            return [{ title, timestamp, path, type: 'essay', image, summary: item.querySelector('.summary')?.textContent.trim() || '' }]
        })
    }

    function header(title = '') {
        return '<header class="m-header"><button class="m-menu-toggle" data-action="menu" aria-label="打开菜单">' + icon('menu.svg') + '</button>' +
            (title ? '<button class="m-page-heading" data-action="back">' + escape(title) + '</button>' : '<button class="m-brand" data-action="home">MIANXIU<span>’BLOG</span></button>') + '</header>'
    }

    function home() {
        const latest = [...state.essays, ...state.galleries].sort((a, b) => b.timestamp - a.timestamp)[0]
        const date = latest ? new Date(latest.timestamp) : new Date()
        const last = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('.')
        return '<div class="m-home"><div class="m-home-stage"><button class="m-home-menu" data-action="menu" aria-label="打开菜单">' + icon('menu.svg') + '</button>' +
            '<nav class="m-home-nav"><a href="#gallery">GALLERY</a><a href="#essay">ESSAY</a></nav>' +
            '<div class="m-home-card"></div><section class="m-last"><span>LAST<br>POST</span><div><time>' + last + '</time><small>「 2018 」.dilemma</small></div></section>' +
            '<div class="m-triangle">' + icon('triangle.svg') + '</div><div class="m-squiggle">' + icon('squiggle.svg') + '</div>' +
            '<section class="m-profile"><div class="m-avatar"><img src="' + asset('avatar.png') + '" alt="mianxiu"></div><strong>mianxiu</strong><div>1994</div><p>something was wrong...</p>' +
            '<div class="m-social"><a href="https://github.com/mianxiu" aria-label="GitHub">' + socialIcon('blue.svg', ['githubIcon/L_1.svg', 'githubIcon/L_2.svg', 'githubIcon/head.svg', 'githubIcon/L_3.svg', 'githubIcon/body.svg']) + '</a><button data-action="menu" aria-label="更多">' + socialIcon('yellow.svg', ['more/1.svg', 'more/2.svg']) + '</button><a href="mailto:mianxiu@mianxiu.me" aria-label="电子邮件">' + socialIcon('red.svg', ['mail/block.svg', 'mail/line.svg']) + '</a></div></section>' +
            '</div><footer class="m-copyright">© ' + new Date().getFullYear() + ' MIANXIU | POWERED BY MIXXO</footer></div>'
    }

    async function animateTriangle() {
        const holder = root.querySelector('.m-triangle')
        if (!holder) return
        try {
            const doc = await load(asset('triangle.svg'))
            if (!holder.isConnected) return
            const svg = doc.querySelector('svg')?.cloneNode(true)
            if (!svg) return
            svg.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
            svg.setAttribute('aria-hidden', 'true')
            holder.replaceChildren(svg)
            const outline = svg.querySelector('path[stroke]')
            const shadow = svg.querySelector('path[fill]')
            // Keep the original mobile silhouette; deform its three vertices like PC.
            const coordinates = outline.getAttribute('d').match(/-?\d*\.?\d+/g).map(Number).slice(0, 6)
            const current = coordinates.slice()
            let target = coordinates.slice(), last = 0, nextTarget = 0, frame = 0
            let pointerX = 0, pointerY = 0
            const reduced = matchMedia('(prefers-reduced-motion: reduce)')
            const home = holder.closest('.m-home')
            const move = event => {
                const rect = home.getBoundingClientRect()
                pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 8
                pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 5
            }
            const reset = () => { pointerX = 0; pointerY = 0 }
            function tick(time) {
                if (!holder.isConnected || document.hidden || reduced.matches) { frame = 0; return }
                const delta = Math.min(64, last ? time - last : 16)
                last = time
                if (time >= nextTarget) {
                    target = coordinates.map(value => value + (Math.random() - 0.5) * 8)
                    nextTarget = time + 1800 + Math.random() * 1200
                }
                mobileTriangleStep(current, target, delta)
                outline.setAttribute('d', `M${current[0]} ${current[1]}L${current[2]} ${current[3]}L${current[4]} ${current[5]}Z`)
                outline.setAttribute('transform', `translate(${pointerX} ${pointerY})`)
                shadow.setAttribute('transform', `translate(${-pointerX * 0.4} ${-pointerY * 0.4})`)
                frame = requestAnimationFrame(tick)
            }
            const resume = () => {
                cancelAnimationFrame(frame)
                frame = 0; last = 0
                if (reduced.matches) {
                    outline.setAttribute('d', `M${coordinates[0]} ${coordinates[1]}L${coordinates[2]} ${coordinates[3]}L${coordinates[4]} ${coordinates[5]}Z`)
                    outline.removeAttribute('transform'); shadow.removeAttribute('transform')
                } else if (!document.hidden) frame = requestAnimationFrame(tick)
            }
            home.addEventListener('pointermove', move, { passive: true })
            home.addEventListener('pointerleave', reset)
            home.addEventListener('pointerup', reset)
            document.addEventListener('visibilitychange', resume)
            reduced.addEventListener('change', resume)
            stopTriangle = () => {
                cancelAnimationFrame(frame)
                document.removeEventListener('visibilitychange', resume)
                reduced.removeEventListener('change', resume)
                home.removeEventListener('pointermove', move)
                home.removeEventListener('pointerleave', reset)
                home.removeEventListener('pointerup', reset)
            }
            resume()
        } catch (error) { console.warn('Mobile triangle animation unavailable', error) }
    }

    function menu() {
        if (root.querySelector('.m-menu-layer')) return
        root.insertAdjacentHTML('beforeend', '<div class="m-menu-layer"><button class="m-menu-shade" data-action="close-menu" aria-label="关闭菜单"></button><nav class="m-menu"><button class="m-menu-close" data-action="close-menu" aria-label="关闭菜单">' + icon('menu.svg') + '</button><a href="#archive">Archive</a><a href="#links">Link</a><a href="#about">About</a></nav></div>')
        root.querySelector('.m-menu-close').focus()
        document.body.classList.add('m-overlay-open')
    }

    function listEssays(posts) {
        return header() + '<main class="m-essay-list">' + posts.map(post => '<a class="m-essay-card" href="' + routeFor(post) + '"><time>' + dateText(post.timestamp) + '</time><h2>' + escape(post.title) + '</h2>' + (post.image ? '<img class="m-preview" src="' + escape(post.image) + '" alt="" loading="lazy">' : '<p>' + escape(post.summary) + '</p>') + '</a>').join('') +
            '<nav class="m-pagination"><button data-action="prev-page" ' + (state.page === 1 ? 'disabled' : '') + '>previous</button><span>' + state.page + ' / 9</span><button data-action="next-page" ' + (state.page === 9 ? 'disabled' : '') + '>next ' + icon('back.svg', 'm-next-icon') + '</button></nav></main>'
    }

    function listGallery() {
        return header() + '<main class="m-gallery-grid">' + state.galleries.map(post => '<a href="' + routeFor(post) + '" aria-label="' + escape(post.title) + '"><img src="' + escape(post.image) + '" alt="' + escape(post.title) + '"></a>').join('') + '</main>'
    }

    function toolbar(post, next) {
        return '<nav class="m-detail-bar"><button class="m-back" data-action="back" aria-label="返回列表">' + escape(post.title) + '</button><button class="m-comment-button" data-action="comments" aria-label="打开评论"><span class="m-comment-count">0</span>' + icon('comment.svg') + '</button>' +
            (next ? '<a class="m-next" href="' + routeFor(next) + '" aria-label="下一个：' + escape(next.title) + '">' + icon('back.svg', 'm-next-icon') + '</a>' : '<button class="m-next" data-action="back" aria-label="返回列表">' + icon('back.svg', 'm-next-icon') + '</button>') + '</nav>'
    }

    function commentPanel() {
        return '<section class="m-comments-panel" aria-label="评论" hidden><header><strong class="m-panel-count">Comments</strong><button data-action="close-comments" aria-label="关闭评论">' + icon('close.svg') + '</button></header><div class="m-comments-scroll"><div id="mixxopost"></div></div></section>'
    }

    function initComments(post) {
        try {
            if (typeof mixxoPost === 'undefined' || typeof AV === 'undefined') throw new Error('评论服务暂时无法连接')
            mixxoPost.init({ appId, appKey, adminNick: 'mianxiu', flexDirection: 'column', commentUrl: encodeURI('/' + post.path + '/') })
            const host = root.querySelector('#mixxopost')
            const observer = new MutationObserver(() => {
                if (!host.isConnected) { observer.disconnect(); return }
                const count = host.querySelector('#mp-comments-num > span')?.textContent || '0'
                root.querySelector('.m-comment-count').textContent = count
                root.querySelector('.m-panel-count').textContent = count + ' Comments'
                const form = host.querySelector('.mixxo-post')
                if (form && host.lastElementChild !== form) host.append(form)
            })
            observer.observe(host, { childList: true, subtree: true, characterData: true })
        } catch (error) {
            root.querySelector('#mixxopost').textContent = '评论服务暂时无法连接，请稍后重试。'
        }
    }

    async function detail(type, path, renderId) {
        if (!new RegExp('^' + type + '/\\d{4}/\\d{2}/\\d{2}/[^/]+$').test(path)) throw new Error('无效的内容地址')
        const doc = await load('/' + path + '/context.html')
        if (renderId !== state.renderId) return
        const posts = type === 'gallery' ? state.galleries : state.essays
        const index = posts.findIndex(post => post.path === path)
        const post = posts[index] || { path, type, title: doc.querySelector('.essay-title, .gallery-context-title')?.textContent.trim() || path.split('/').pop() }
        const next = index >= 0 ? posts[index + 1] : null
        if (type === 'gallery') {
            root.innerHTML = '<div class="m-detail"><main class="m-gallery-images">' + Array.from(doc.querySelectorAll('.gallery-img')).map(el => '<img src="' + escape(el.getAttribute('src')) + '" alt="' + escape(post.title) + '">').join('') + '</main>' + toolbar(post, next) + commentPanel() + '</div>'
        } else {
            doc.querySelectorAll('#mixxopost, .footer, script').forEach(el => el.remove())
            const banner = doc.querySelector('._banner')
            if (banner) {
                banner.setAttribute('aria-hidden', 'true')
            }
            // Keep the first release's banner placement for the real-device comparison.
            root.innerHTML = '<main class="m-article">' + doc.body.innerHTML + toolbar(post, next) + '</main>' + commentPanel()
            root.querySelectorAll('pre code').forEach(el => { if (window.hljs) hljs.highlightBlock(el) })
        }
        initComments(post)
        document.title = post.title + " | Mianxiu's Blog"
    }

    async function archive() {
        const docs = await Promise.all(Array.from({ length: 9 }, (_, i) => load('/essay/pages/' + (i + 1) + '/index.html')))
        const all = [...state.essays, ...docs.flatMap(readEssays), ...state.galleries]
        const posts = [...new Map(all.map(post => [post.path, post])).values()].sort((a, b) => b.timestamp - a.timestamp)
        state.essays = posts.filter(post => post.type === 'essay')
        const years = [...new Set(posts.map(post => new Date(post.timestamp).getFullYear()))]
        return header('Archive') + '<main class="m-archive">' + years.map((year, index) => '<details ' + (index < 2 ? 'open' : '') + '><summary>' + year + icon('more.svg') + '</summary><ul>' + posts.filter(post => new Date(post.timestamp).getFullYear() === year).map(post => '<li><a href="' + routeFor(post) + '">' + escape(post.title) + '</a><time>' + new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() + '</time></li>').join('') + '</ul></details>').join('') + '</main>'
    }

    async function render() {
        const id = ++state.renderId
        state.commentsOpen = false
        stopTriangle()
        stopTriangle = () => {}
        root.scrollTop = 0
        document.body.classList.remove('m-overlay-open')
        document.title = "Mianxiu's Blog"
        const route = mobileRouteForLocation(location)
        window.scrollTo(0, 0)
        root.innerHTML = '<p class="m-loading" role="status">Loading…</p>'
        try {
            if (/^(gallery|essay)=/.test(route)) {
                const split = route.indexOf('=')
                await detail(route.slice(0, split), decodeURIComponent(route.slice(split + 1)), id)
            } else if (route === 'gallery') root.innerHTML = listGallery()
            else if (route === 'essay') {
                const doc = state.page === 1 ? null : await load('/essay/pages/' + state.page + '/index.html')
                if (id !== state.renderId) return
                const posts = readEssays(doc || await load('/essay/index.html'))
                if (id !== state.renderId) return
                state.essays = [...new Map([...state.essays, ...posts].map(post => [post.path, post])).values()].sort((a, b) => b.timestamp - a.timestamp)
                root.innerHTML = listEssays(posts)
            } else if (route === 'archive') {
                const html = await archive()
                if (id === state.renderId) root.innerHTML = html
            } else if (route === 'about') {
                const jsVersion = new URL(document.querySelector('script[src*="/js/mobile-app.js"]').src).searchParams.get('v') || '未标记'
                const doc = await load('/about/index.html?v=' + encodeURIComponent(jsVersion))
                if (id !== state.renderId) return
                root.innerHTML = header('About') + '<main class="m-about"><h2>我</h2>' + doc.body.innerHTML + '<section><h2>Computer</h2><div class="m-computer-placeholder" aria-label="设备信息待补充"></div></section></main>'
            } else if (route === 'links') root.innerHTML = header('Link') + '<main class="m-links"><a href="https://github.com/mianxiu">GitHub · mianxiu</a><a href="mailto:mianxiu@mianxiu.me">mianxiu@mianxiu.me</a></main>'
            else root.innerHTML = home()
            if (id !== state.renderId) return
            syncViewport()
            if (root.querySelector('.m-home')) animateTriangle()
            root.querySelectorAll('img.m-preview').forEach(img => img.addEventListener('error', () => img.remove(), { once: true }))
        } catch (error) {
            if (id === state.renderId) root.innerHTML = header() + '<div class="m-error"><p>内容暂时无法加载。</p><button data-action="retry">重试</button><a href="#">返回首页</a></div>'
            console.error(error)
        }
    }

    root.addEventListener('click', event => {
        const button = event.target.closest('[data-action]')
        if (!button) return
        switch (button.dataset.action) {
            case 'menu': menu(); break
            case 'close-menu': root.querySelector('.m-menu-layer')?.remove(); document.body.classList.remove('m-overlay-open'); break
            case 'home': go(''); break
            case 'back': go(location.hash.startsWith('#gallery=') ? '#gallery' : location.hash.startsWith('#essay=') || location.pathname.startsWith('/essay/') ? '#essay' : ''); break
            case 'comments': root.querySelector('.m-comments-panel').hidden = false; state.commentsOpen = true; document.body.classList.add('m-overlay-open'); root.querySelector('[data-action="close-comments"]').focus(); break
            case 'close-comments': root.querySelector('.m-comments-panel').hidden = true; state.commentsOpen = false; document.body.classList.remove('m-overlay-open'); root.querySelector('[data-action="comments"]').focus(); break
            case 'next-page': if (state.page < 9) { state.page++; render() } break
            case 'prev-page': if (state.page > 1) { state.page--; render() } break
            case 'retry': render(); break
        }
    })
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || event.repeat) return
        const close = root.querySelector('.m-menu-layer [data-action="close-menu"]') || (state.commentsOpen ? root.querySelector('[data-action="close-comments"]') : root.querySelector('[data-action="back"]'))
        close?.click()
    })
    window.addEventListener('hashchange', render)
    window.addEventListener('popstate', render)
    root.innerHTML = '<p class="m-loading" role="status">Loading…</p>'
    try {
        const [essayDoc, galleryDoc] = await Promise.all([load('/essay/index.html'), load('/gallery/index.html')])
        state.essays = readEssays(essayDoc)
        state.galleries = Array.from(galleryDoc.querySelectorAll('.gallery-link')).map(el => {
            const path = el.dataset.href
            const [, year, month, day] = path.match(/gallery\/(\d{4})\/(\d{2})\/(\d{2})\//)
            return { path, type: 'gallery', title: el.querySelector('.gallery-title').textContent.trim(), timestamp: new Date(+year, +month - 1, +day).getTime(), image: el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1].replace(/^\.\//, '/') }
        })
        await render()
    } catch (error) {
        root.innerHTML = '<div class="m-error">内容加载失败，请刷新页面重试。</div>'
        console.error(error)
    }
}
