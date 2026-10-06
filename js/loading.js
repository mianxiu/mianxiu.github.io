/* Common loading silhouette and motion, also used by mobile home. */
function mobileTriangleStep(current, target, delta) {
    const amount = 1 - Math.exp(-Math.max(0, Math.min(delta, 64)) / 900)
    current.forEach((value, i) => { current[i] = value + (target[i] - value) * amount })
    return current
}

function siteLoadingMarkup() {
    // Inline the home silhouette so the loading indicator needs no additional request.
    return '<div class="m-loading" role="status" aria-live="polite" aria-busy="true"><span class="m-loading-label">正在加载</span><div class="m-loading-triangle"><svg aria-hidden="true" viewBox="0 0 277.993 236.527" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M117.993 228.527L72.9929 40.0268L277.993 236.527L117.993 228.527Z" fill="#F3F3F3"/><path d="M66.9929 216.027L0.992927 1.52683L247.493 216.027H66.9929Z" stroke="black"/></svg></div></div>'
}

function animateSiteTriangle(holder, interactive = false) {
    if (!holder) return () => {}
    const svg = holder.querySelector('svg')
    if (!svg) return () => {}
    const outline = svg.querySelector('path[stroke]')
    const shadow = svg.querySelector('path[fill]')
    // Keep the original mobile silhouette; deform its three vertices like PC.
    const coordinates = outline.getAttribute('d').match(/-?\d*\.?\d+/g).map(Number).slice(0, 6)
    const current = coordinates.slice()
    let target = coordinates.slice(), last = 0, nextTarget = 0, frame = 0
    let pointerX = 0, pointerY = 0
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const home = interactive ? holder.closest('.m-home') : null
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
        const driftX = interactive ? 0 : (current[0] - coordinates[0]) * 0.6
        const driftY = interactive ? 0 : (current[1] - coordinates[1]) * 0.6
        shadow.setAttribute('transform', `translate(${-pointerX * 0.4 - driftX} ${-pointerY * 0.4 - driftY})`)
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
    home?.addEventListener('pointermove', move, { passive: true })
    home?.addEventListener('pointerleave', reset)
    home?.addEventListener('pointerup', reset)
    document.addEventListener('visibilitychange', resume)
    reduced.addEventListener('change', resume)
    const stop = () => {
        cancelAnimationFrame(frame)
        document.removeEventListener('visibilitychange', resume)
        reduced.removeEventListener('change', resume)
        home?.removeEventListener('pointermove', move)
        home?.removeEventListener('pointerleave', reset)
        home?.removeEventListener('pointerup', reset)
    }
    resume()
    return stop
}

let desktopLoadingCount = 0
let stopDesktopLoading = () => {}
function beginDesktopLoading() {
    const layer = document.querySelector('#ajaxProgress')
    if (!layer) return () => {}
    if (desktopLoadingCount++ === 0) {
        layer.hidden = false
        layer.classList.add('is-loading')
        layer.innerHTML = siteLoadingMarkup()
        stopDesktopLoading = animateSiteTriangle(layer.querySelector('.m-loading-triangle'))
    }
    let finished = false
    return () => {
        if (finished) return
        finished = true
        if (--desktopLoadingCount === 0) {
            stopDesktopLoading()
            stopDesktopLoading = () => {}
            layer.hidden = true
            layer.classList.remove('is-loading')
            layer.replaceChildren()
        }
    }
}
