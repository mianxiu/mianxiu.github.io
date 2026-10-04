// Keep a single desktop home animation, even after repeated navigation.
function triangle() {
    if (triangle.stop) triangle.stop()
    const outline = document.querySelector('#triangle')
    const shadow = document.querySelector('#gray')
    if (!outline || !shadow) return

    const outlineCtx = outline.getContext('2d')
    const shadowCtx = shadow.getContext('2d')
    const original = [60, 15, 155, 248, 404, 241]
    let points = original.slice(), target = getRandom(original, [-1, 1]), age = 0
    let frame = null, active = false, lastPaint = null, pointer = null

    function draw(context, canvas, vertices, fill) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.beginPath()
        context.moveTo(vertices[0], vertices[1])
        for (let i = 2; i < vertices.length; i += 2) context.lineTo(vertices[i], vertices[i + 1])
        context.closePath()
        if (fill) {
            context.fillStyle = '#f2f2f2'
            context.fill()
        } else {
            context.lineWidth = 1
            context.strokeStyle = 'black'
            context.stroke()
        }
    }

    function pause() {
        active = false
        cancelAnimationFrame(frame)
        frame = null
        lastPaint = null
        pointer = null
    }

    function tick(time) {
        frame = null
        if (!outline.isConnected || !shadow.isConnected) { stop(); return }
        if (!active || document.hidden) { pause(); return }

        // Coalesce pointer input into one transform update per animation frame.
        if (pointer) {
            const width = document.body.clientWidth
            const height = document.body.clientHeight
            shadow.style.transform = 'translate(' + (width - pointer.x) * .05 + 'px,' + (height - pointer.y) * .02 + 'px)'
            outline.style.transform = 'translate(' + (pointer.x - width) * .02 + 'px,' + (pointer.y - height) * .005 + 'px)'
            pointer = null
        }

        // The subtle outline drift needs only 30 paints/s; use elapsed time to preserve speed.
        if (lastPaint === null || time - lastPaint >= 1000 / 30) {
            const steps = lastPaint === null ? 1 : Math.min(3, (time - lastPaint) / (1000 / 60))
            lastPaint = time
            for (let i = 0; i < points.length; i++) {
                const distance = target[i] - points[i]
                points[i] += Math.sign(distance) * Math.min(Math.abs(distance), .06 * steps)
            }
            age += steps
            if (points.every((value, i) => Math.abs(value - target[i]) < .01) || age > 100) {
                target = getRandom(original, [-1, 1])
                age = 0
            }
            draw(outlineCtx, outline, points, false)
        }
        frame = requestAnimationFrame(tick)
    }

    function sync() {
        if (!outline.isConnected || !shadow.isConnected) { stop(); return }
        const visible = !document.hidden && outline.getClientRects().length > 0
        if (!visible) { pause(); return }
        if (!active) {
            active = true
            frame = requestAnimationFrame(tick)
        }
    }

    function mousemove(event) {
        if (active) pointer = { x: event.clientX, y: event.clientY }
    }

    const observer = new MutationObserver(sync)
    for (let parent = outline.parentElement; parent; parent = parent.parentElement) {
        observer.observe(parent, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] })
    }
    window.addEventListener('mousemove', mousemove, { passive: true })
    window.addEventListener('resize', sync)
    window.addEventListener('pagehide', pause)
    window.addEventListener('pageshow', sync)
    document.addEventListener('visibilitychange', sync)

    function stop() {
        pause()
        observer.disconnect()
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('resize', sync)
        window.removeEventListener('pagehide', pause)
        window.removeEventListener('pageshow', sync)
        document.removeEventListener('visibilitychange', sync)
        if (triangle.stop === stop) triangle.stop = null
    }
    triangle.stop = stop
    draw(shadowCtx, shadow, [47, 73, 176, 297, 377, 209], true)
    draw(outlineCtx, outline, points, false)
    sync()
    return stop
}
