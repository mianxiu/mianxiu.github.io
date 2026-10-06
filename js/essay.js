
// ajax同目录内容
(() => {
    window.matchMedia('(max-width: 767px)').addEventListener('change', () => location.reload())
    if (window.matchMedia('(max-width: 767px)').matches) {
        const path = decodeURI(location.pathname).replace(/^\//, '').replace(/\/$/, '')
        location.replace('/#essay=' + encodeURIComponent(path))
        return
    }
    document.querySelector('title').innerText = decodeURI(window.location.href.split(/\//)[7])+" | Mianxiu's blog"
    const mosaics = document.createElement('script')
    mosaics.src = '/js/image-placeholders.js?v=20261006-04'
    document.head.append(mosaics)
    let settled = false, stopLoading = () => {}
    const finish = () => { settled = true; stopLoading() }
    // Standalone articles do not load the home app's scripts.
    if (typeof beginDesktopLoading === 'function') {
        stopLoading = beginDesktopLoading()
    } else {
        const script = document.createElement('script')
        script.src = '/js/loading.js?v=20261006-01'
        script.onload = () => {
            if (!settled) stopLoading = beginDesktopLoading()
        }
        document.head.append(script)
    }
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        finish()
        if (this.status < 200 || this.status >= 300) {
            console.error('Request failed:', this.status, './context.html')
            return
        }
        document.documentElement.scrollTop = 0
        document.querySelector('#essay-response').innerHTML = this.responseText
        document.querySelector('#essayClose').style.transform = 'scale(1,1)'
        document.querySelector('#main').style = 'display:flex;justify-content:center;'// height:100vh;
        document.querySelector('#essayClose').addEventListener('click', () => {
        document.querySelector('#essayClose').style.transform = ''  
        window.location.href = '/'
        })
        // 高亮
        for (let i of document.querySelectorAll('pre')) {
            hljs.highlightBlock(i)
        }

        mixxoPost.init({
            appId:'N8ILsvPRQiKpIOlRETRw0ShQ-gzGzoHsz',
            appKey:'hp80QRKBtn8fT48ImaCJxqFE',
            adminNick:'mianxiu',
            frameWidth:'7.6rem'
        })
    }
    oReq.responseType = ''
    oReq.onerror = oReq.ontimeout = oReq.onabort = finish
    oReq.open("get", './context.html', true);
    try { oReq.send() } catch (error) { finish(); throw error }
})()
