let styleDisplay = function (selector, type) {
    if (selector.length !== undefined) {
        selector.map(el => {
            el.style.display = type
        })
    } else {
        selector.style.display = type
    }
}



let htmlFontSize = parseInt(getComputedStyle($('html'), null).getPropertyValue('font-size').replace('px'))
// 关闭按钮
// 添加hash会写入多余history,该值用与记数=>308行
let historylength = ''
let listenEassyClose = function () {
    let back = function () {
        console.log('close')
        if (historylength !== '') {
            history.go(historylength - history.length - 2)
        } else {
            history.go(-1)
        }
    }
    $('#essayClose').addEventListener('click', back, false)
}

//写入内容
let writeContent = function () {
    console.log('DONE', this.status);

    this.responseText === undefined ? $('#rule').innerHTML = '' : $('#rule').innerHTML = this.responseText
    //根据自定义id ajax

    let hidden = function (type) {
        switch (type) {
            case 'on':
                styleDisplay([$('#index'), $('#background-box')], 'none')
                styleDisplay($('#logo_other'), 'block')
                $('#allContext').style.marginTop = '1.2rem'
                mp3PlayerType('min')
                navHidden('on')
                $('#footer').classList.add('hidden')
                break;
            case 'off':
                styleDisplay($('#index'), 'block')
                mp3PlayerType('normal')
                navHidden('off')
                break;
        }
    }


    let data_id = $('#rule').dataset.id
    let state = {
        name: data_id
    }

    switch (data_id) {
        case 'home':
            hidden('off')
            triangle()
            break;
        case 'gallery':
            $('html').classList.add('html-color')
            hidden('on')
            gallery_overlay()
            gallery_tag()
            history.pushState(state, '', '')
            break;
        case 'essay':
            hidden('on')
            essayAjax()
            history.pushState(state, '', '')
            break;
    }
}


//3 essay列表---------------------------------------------------------------------------
//获取内容
let writeEssay = function () {
    document.documentElement.scrollTop = 0
    styleDisplay([$('#logo_other'), $('#essay')], 'none')
    $('#essayText').style = 'height:100vh;width:100vw;'
    $('#navigation').style.filter = 'blur(0.04rem)'
    $('#essayText>div').innerHTML = this.responseText
    $('#essayClose').style.transform = 'scale(1,1)'
    $('#main').style = 'display:flex;justify-content:center;height:100vh;'
    $('title').innerText = decodeURI(window.location.href.split(/\//)[7]) + " | Mianxiu's blog"

    // 高亮
    for (let i of document.querySelectorAll('pre')) {
        hljs.highlightBlock(i)
    }

    mixxoPost.init({
        appId: 'N8ILsvPRQiKpIOlRETRw0ShQ-gzGzoHsz',
        appKey: 'hp80QRKBtn8fT48ImaCJxqFE',
        adminNick: 'mianxiu'

    })
}

function essayAjax() {

    //  history.replaceState({ name: 'essay' }, "mianxiu's blog", '/')
    let originScroll = 0
    $('#essayLeft').addEventListener('click', e => {
        if (e.target.tagName === 'H1') {
            originScroll = document.documentElement.scrollTop
            let eP = e.target.parentNode
            //标题
            let ePostH1 = eP.children[2].innerText
            //日期
            let date = new Date(eP.children[0].innerText)
            let ePostDate = date.getFullYear() + '/' + (date.getMonth() < 10 ? '0' + (Number(date.getMonth()) + 1) : (Number(date.getMonth()) + 1)) + '/' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
            ajax('./essay/' + ePostDate + '/' + encodeURI(ePostH1) + '/context.html', writeEssay)
            // url斜杠！！！
            let state = {
                name: 'essayContext',
                scrollTop: document.documentElement.scrollTop,
                type: 'forward'
            }


            history.pushState(state, ePostH1, './essay/' + ePostDate + '/' + ePostH1 + '/')
        }
    })

    //分页
    $('#pages').addEventListener('click', e => {
        if (e.target.tagName === 'LI') {
            let l = './essay/pages/' + e.target.innerText + '/index.html'
            ajax(l, essayLi)

            // 页面
            let on = $('#pages').childNodes[1].children
            for (let i = 0; i < on.length; i++) {
                on[i].className = ''
            }
            e.target.className = 'onPage'
        }
    })

    let essayLi = function () {
        $('#essayLeft > ul').innerHTML = this.responseText
        document.documentElement.scrollTop = 0
    }

}




//4 gallery ---------------------------------------------------------------------------
//  画廊遮罩层

let writeGallery = function (event) {
    $('#galleryContext > div').innerHTML += this.responseText

    mixxoPost.init({
        appId: 'N8ILsvPRQiKpIOlRETRw0ShQ-gzGzoHsz',
        appKey: 'hp80QRKBtn8fT48ImaCJxqFE',
        adminNick: 'mianxiu',
        flexDirection: 'column'
    })

    let n = decodeURI(window.location.pathname).split('/')[5]
    $('title').innerText = n + ' | Mianxiu\'s Blog...'


    // galleryRight 绑定
    let isScroll = function (deltaY, selector) {
        function getHeight(selector) {
            return Number(window.getComputedStyle(selector, null).height.replace(/px/g, '')) // 
        }
        let s = 100;
        let d = getHeight($('.gallery-page'))
        let c = document.body.offsetHeight // 屏幕高度
        let y = window.getComputedStyle(selector, null).transform.split(',')[5] === undefined ? 0 : Number(window.getComputedStyle(selector, null).transform.split(',')[5].replace(/\)/g, ''))
        let h = getHeight(selector)
        let infoHeight = getHeight($('.gallery-context-info'))
        let mixxoPostHeight = getHeight($('#mixxopost'))

        if (window.getComputedStyle($('.gallery-right-background'), null).position === 'fixed') {
            if (deltaY < 0) {
                selector.style.transform = y - s < 0 ? '' : `translateY(${y+=s}px)`
            } else {
                if (c < h) {
                    selector.style.transform = (c - h - d > y - s) && c < h ? `translateY(${c-h-d}px)` : `translateY(${y-=s}px)`
                }
            }
        }

    }

    let stopScroll = function (event) {
        event.preventDefault()
    }
    let removeScroll = function (type) {
        //   
        switch (type) {
            case true:
                $('html').removeEventListener('wheel', stopScroll, false)
                break;
            case false:
                $('html').addEventListener('wheel', stopScroll, false)
                break;
        }
    }

    let addScroll = function () {
        let galleryRightBackground = $('.gallery-right-background')
        let galleryRight = $('.gallery-right')



        let galleryRighHandle = function (event) {
            isScroll(event.deltaY, galleryRight)
        }

        let s1
        galleryRightBackground.addEventListener('mouseenter', event => {
            let p = window.getComputedStyle(galleryRightBackground, null).position
            if (p === 'fixed') {
                galleryRightBackground.addEventListener('wheel', galleryRighHandle, false)
                removeScroll(false)
            }
        })

        galleryRightBackground.addEventListener('mouseleave', event => {
            galleryRightBackground.removeEventListener('wheel', galleryRighHandle, false)
            removeScroll(true)
        })

        // 用来 使galleryRight 复位
        let clearStyle = () => {
            let s = window.getComputedStyle(galleryRightBackground, null).position
            if (s === 'static') {
                galleryRight.style = ''
            }
            if (window.location.pathname === '/') {
                clearInterval(s1)
            }
        }
        s1 = setInterval(clearStyle, 1000)
    }
    addScroll()

    // gallery-page 页面跳转
    let c = $('#galleryContext')
    let pre = c.getAttribute('previous-id')
    let next = c.getAttribute('next-id')

    let preNode = $('.gallery-previous > span')
    let nextNode = $('.gallery-next > span')


    let  Pre = document.getElementById(pre)
    let Next = document.getElementById(next)
    if(Pre!==null){
        preNode.setAttribute('data-title',Pre.children[0].children[0].innerText)
    }
    if(Next!==null){
        nextNode.setAttribute('data-title',Next.children[0].children[0].innerText)
    }
    
    
    let jumpPage = function (event) {
        let reAjax = async (selectorId) => {
            await history.back()
            await setTimeout(() => {
                document.getElementById(selectorId).children[0].click()
            }, 10)
            removeScroll(true)
        }


        switch (event.target.className) {
            case 'gallery-previous':
                reAjax(pre)
                break;
            case 'gallery-next':
                reAjax(next)
                break;
            default:
                if (/SPAN|IMG/gm.test(event.target.tagName)) {
                    switch (event.target.parentNode.className) {
                        case 'gallery-previous':
                            reAjax(pre)
                            break;
                        case 'gallery-next':
                            reAjax(next)
                            break;
                    }
                }
                break;
        }
    }

    $All('.gallery-page > div').forEach(el => {
        el.addEventListener('click', jumpPage)
    })


    // 判断是否有前一页/下一页
    if (/null/gm.test(pre)) {
        $('.gallery-previous').classList.add('hidden')
    } else if (/null/gm.test(next)) {
        $('.gallery-next').classList.add('hidden')
    }

    // 
    $('#galleryContext > div').addEventListener('wheel',event=>{
        console.log(event.target.className)
        let a = $('.gallery-imgs')
        let b = $('.gallery-background')
        if(a.contains(event.target)||b.contains(event.target)){
            if(event.deltaY > 0){
                $('.gallery-page').classList.add('gllery-page-show')
            }else{
                $('.gallery-page').classList.remove('gllery-page-show')
            }
        }     
    })
}



// 
function gallery_overlay() {
    // css hover冒泡问题
    $('#gallery').addEventListener('mouseenter', () => {
        for (let i = 0; i < $All('.gallery-link').length; i++) {
            $All('.gallery-link')[i].addEventListener('mouseenter', event => {
                styleDisplay(event.target.children[0], 'block')
            })
            $All('.gallery-link')[i].addEventListener('mouseleave', event => {
                styleDisplay(event.target.children[0], 'none')
            })
        }
    })

}

function gallery_tag() {
    let originScroll
    // match tags
    let g = $('.gallery-toggle-tags')
    let toggleTag = function (elInnerText) {
        // elInnertext is .gallery-tag's innertext
        for (let e of $All('.gallery-link')) {
            if (!new RegExp(elInnerText, 'gm').test(e.getAttribute('data-tag'))) {
                e.classList.add('gallery-none')
            }
        }
        if (!new RegExp(elInnerText, 'gm').test(g.getAttribute('data-toggle-tag'))) {
            $('#gallery').style.transform = 'translateY(.5rem)'
            g.innerHTML += '<span class="toggle-tag">' + elInnerText.replace(/#/, '') + '</span>'
            g.setAttribute('data-toggle-tag', g.getAttribute('data-toggle-tag') + elInnerText)
        }
    }

    // tag & 详细页面
    for (let el of $All('.gallery-link')) {

        el.addEventListener('click', event => {
            originScroll = window.location.scrollTop
            if (event.target.className === 'gallery-tag') {
                // 筛选tag
                toggleTag(event.target.innerText)
            } else if (event.target.tagName === 'EM') {
                toggleTag(event.target.parentNode.innerText)
            }
            // 详细页面
            else if (/gallery-overlay|gallery-title|gallery-description|gallery-tags/gm.test(event.target.className)) {
                let dataHref, dataId
                let state = {
                    name: 'galleryContext',
                    scrollTop: document.documentElement.scrollTop
                }

                // 点击判断
                if (/gallery-title|gallery-description|gallery-tags/gm.test(event.target.className)) {
                    dataHref = event.target.parentNode.parentNode.getAttribute('data-href')
                    dataId = Number(event.target.parentNode.parentNode.getAttribute('data-id')) // 下一页
                } else {
                    dataHref = event.target.parentNode.getAttribute('data-href')
                    dataId = Number(event.target.parentNode.getAttribute('data-id'))
                }

                // 设置跳转
                let preId = (dataId - 1) < 0 ? 'null' : 'gallery-link-' + (dataId - 1)
                let nextId = (dataId + 1) >= $All('.gallery-link').length ? 'null' : 'gallery-link-' + (dataId + 1)

                $('#galleryContext').setAttribute('previous-id', preId)
                $('#galleryContext').setAttribute('next-id', nextId)


                ajax(dataHref + '/context.html', writeGallery)
                styleDisplay([$('#gallery'), $('#logo_other')], 'none')
                history.pushState(state, null, dataHref + '/')
                document.documentElement.scrollTop = 0;

            }
        })
    }

    // toggle tags
    g.addEventListener('click', event => {
        if (event.target.className === 'toggle-tag') {
            g.setAttribute('data-toggle-tag', g.getAttribute('data-toggle-tag').replace(new RegExp('#' + event.target.innerText, 'gm'), ''))
            for (let e of $All('.gallery-link')) {
                if (new RegExp(g.getAttribute('data-toggle-tag'), 'gm').test(e.getAttribute('data-tag')) || g.getAttribute('data-toggle-tag') === 'undefined') {
                    e.classList.remove('gallery-none')
                }
            }
            event.target.remove()
            if (g.getAttribute('data-toggle-tag') === '') {
                $('#gallery').style = ''
            }
        }
    })







}





// history API 操作
/**
 * 不同页面(或层级)通过stateObj写入唯一值,like state = {name:essay,scroll:current num},state = {name:essayContext}
 * 前进、后退按钮会触发'popstate'事件，通过唯一值操作页面
 * 当前页面层级为0,后退触发-1页面的stateObj,前进触发+1层
 */

history.pushState({
    name: 'home'
}, '', '')
window.addEventListener("popstate", event => {
    if (history.state !== null) {
        switch (history.state.name) {
            case 'home':
                $('#logo_other').click();
                $('#footer').classList.remove('hidden')
                history.pushState({
                    name: 'home'
                }, '', '')
                break;
            case 'essay':
                $('#essayClose').style.transform = ''
                $('#essay').style.display = ''
                $('#essayText').style = ''
                $('#navigation').style.filter = 'blur(0px)'
                $('#essayText>div').innerHTML = ''
                $('#main').style = ''
                $('title').innerText = 'Mianxiu\'s blog'
                $('#logo_other').style.display = ''
                $('html').classList.remove('html-color')
                document.documentElement.scrollTop = history.state.scrollTop
                break;
            case 'gallery':
                $('#gallery').style.display = ''
                $('#galleryContext > div').innerHTML = ''
                $('#logo_other').style.display = ''
                document.documentElement.scrollTop = history.state.scrollTop
                $('title').innerText = 'Mianxiu\'s Blog...'
                $('html').classList.add('html-color')
                break;
            case 'essayContext':
                // 前进动作
                ajax(window.location.href + '/context.html', writeEssay)
                break;
            case 'galleryContext':
                ajax(window.location.href + '/context.html', writeGallery)

                styleDisplay([$('#gallery'), $('#logo_other')], 'none')
                document.documentElement.scrollTop = 0
                $('title').innerText = decodeURI(window.location.href.slice(0, -1).split('/').pop()) + ' | Mianxiu\'s Blog...'
                break;
        }
    } else if (/#fn/g.test(window.location.href)) {
        console.log('fn-don\'t' + historylength)
        if (historylength === '') {
            historylength = history.length
        }
    } else {

        //   console.log('fn')
        //   $('#logo_other').click()
        //   $('title').innerText = 'Mianxiu\'s Blog...'
        //   $('html').classList.remove('html-color')
        //   history.pushState({ name: 'home' }, '', '')
    }

});
