/* Pre-baked frosted previews for AJAX, mobile routes and standalone articles. */
(() => {
    const selector = '._banner, .preview-img, .gallery-link, img.gallery-img, img.m-preview, .m-gallery-grid img, .m-gallery-images img, .essay-context img'
    const records = new WeakMap()
    let manifest
    function imageKey(source) {
        try {
            const url = new URL(source, document.baseURI)
            return url.hostname === 'img.mianxiu.me' ? 'https://img.mianxiu.me' + url.pathname :
                url.origin === location.origin ? decodeURI(url.pathname) : ''
        } catch { return '' }
    }
    function data() {
        if (!manifest) manifest = fetch('/assets/image-placeholders.json?v=20261006-06')
            .then(response => { if (!response.ok) throw new Error('Image preview manifest unavailable'); return response.json() })
            .catch(error => { console.warn(error.message); return {} })
        return manifest
    }
    function forget(element) {
        const record = records.get(element)
        if (!record) return
        lazy?.unobserve(element)
        record.start = null
        record.cancel?.()
        records.delete(element)
    }
    const lazy = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lazy.unobserve(entry.target)
                const record = records.get(entry.target)
                if (record?.start) { const start = record.start; record.start = null; start() }
            }
        })
    }, { rootMargin: '300px' }) : null

    async function prepare(element) {
        const previous = records.get(element)
        const img = element.tagName === 'IMG'
        const original = img ? element.getAttribute('src') : element.style.backgroundImage
        if (previous && (original === previous.original || original === previous.applied)) return
        forget(element)
        if (!original) return
        const source = img ? original : original.match(/^url\(["']?(.*?)["']?\)$/)?.[1]
        if (!source || source.startsWith('data:') || (img && element.hasAttribute('srcset'))) return
        // Register before waiting so repeated mutations do not create extra requests.
        const record = { original, applied: original, start: null }
        records.set(element, record)
        lazy?.unobserve(element)
        const preview = (await data())[imageKey(source)]
        if (!preview || !element.isConnected || records.get(element) !== record) return
        if (img && element.complete && element.naturalWidth > 0) return
        element.setAttribute('data-mosaic-state', 'pending')
        if (img) element.setAttribute('src', preview.preview)
        else element.style.backgroundImage = 'url("' + preview.preview + '")'
        record.applied = img ? element.getAttribute('src') : element.style.backgroundImage
        record.start = () => {
            if (!element.isConnected || records.get(element) !== record) return
            const full = new Image()
            record.cancel = () => { full.onload = full.onerror = null; full.removeAttribute('src') }
            let finished = false
            const settle = async success => {
                if (finished) return
                finished = true
                full.onload = full.onerror = null
                record.cancel = null
                if (success && full.decode) { try { await full.decode() } catch {} }
                if (!element.isConnected || records.get(element) !== record) return
                // Do not overwrite a newer source supplied by another renderer.
                const current = img ? element.getAttribute('src') : element.style.backgroundImage
                if (current !== record.applied) return
                if (success) {
                    if (img) element.setAttribute('src', original)
                    else element.style.backgroundImage = original
                }
                element.setAttribute('data-mosaic-state', success ? 'loaded' : 'error')
            }
            full.onload = () => settle(true)
            full.onerror = () => settle(false) // Keep the preview, never a broken image icon.
            full.src = source
            if (full.complete) settle(full.naturalWidth > 0)
        }
        if (img && element.loading === 'lazy' && lazy) lazy.observe(element)
        else { const start = record.start; record.start = null; start() }
    }
    function scan(node) {
        if (node.nodeType !== 1) return
        if (node.matches(selector)) prepare(node)
        node.querySelectorAll(selector).forEach(prepare)
    }
    function removed(node) {
        if (node.nodeType !== 1 || node.isConnected) return
        forget(node)
        node.querySelectorAll(selector).forEach(forget)
    }
    function init() {
        scan(document.body)
        // Only inspect added content/source changes; triangle animation never triggers this.
        new MutationObserver(changes => changes.forEach(change => {
            if (change.type === 'childList') { change.removedNodes.forEach(removed); change.addedNodes.forEach(scan) }
            else if (change.target.matches(selector)) prepare(change.target)
        })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'style'] })
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
    else init()
})()
