let htmlFontSize = parseInt(getComputedStyle($('html'), null).getPropertyValue('font-size').replace('px'))
// 关闭按钮
listenEassyClose = function(){
    let back = function () {
        console.log('close')
        history.go(-1)
    }
    $('#essayClose').addEventListener('click', back, false)
}
// logo_other
function logo_other() {
    $('#logo_other').addEventListener('click', () => {
        $('#rule').innerHTML = ''
        $('#index').style.display = 'block'
        $('#background-box').style.display = 'block'
        $('#logo_other').style.display = ''
        mp3PlayerType('normal')
        navHidden('off')
        triangle()
    })
}


//写入内容
let writeContent = function () {
    console.log('DONE', this.status);

    this.responseText === undefined ? $('#rule').innerHTML = '' : $('#rule').innerHTML = this.responseText
    //根据自定义id ajax

    let hidden = function (type) {
        switch (type) {
            case 'on':
                $('#index').style.display = 'none'
                $('#logo_other').style.display = 'block'
                $('#allContext').style.marginTop = '1.2rem'
                $('#background-box').style.display = 'none'
                mp3PlayerType('min')
                navHidden('on')
                break;
            case 'off':
                $('#index').style.display = 'block'
                mp3PlayerType('normal')
                navHidden('off')
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

//导航,ajax
function navGetAjax() {

    $('#navigation ul').addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
            for (let i of $All('#navigation a')) {
                i.className = ''
            }
            e.target.className = 'nav-active'
            let u = e.target.innerText.toLowerCase()
            //window.history.replaceState(null,null,'/'+u)  
            //添加自定义data属性
            $('#rule').dataset.id = u
            u === 'home' ? writeContent() : ajax(u + '/index.html', writeContent)
        }
    })
}



//3 essay列表---------------------------------------------------------------------------
//获取内容
let writeEssay = function () {
    document.documentElement.scrollTop = 0
    $('#essay').style.display = 'none'
    $('#essayText').style = 'height:100vh;width:100vw;'
    $('#navigation').style.filter = 'blur(0.04rem)'
    $('#essayText>div').innerHTML = this.responseText
    $('#essayClose').style.transform = 'scale(1,1)'
    $('#main').style = 'display:flex;justify-content:center;height:100vh;'
    $('title').innerText = decodeURI(window.location.href.split(/\//)[7]) + " | Mianxiu's blog"
    $('#logo_other').style.display = 'none'
    // 高亮
     for (let i of document.querySelectorAll('pre')) {
            hljs.highlightBlock(i)
        }
}

function essayAjax() {

    //  history.replaceState({ name: 'essay' }, "mianxiu's blog", '/')
    let originScroll = 0
    $('#essayLeft').addEventListener('click', e => {
        if (e.target.tagName === 'H3') {
            originScroll = document.documentElement.scrollTop
            let eP = e.target.parentNode
            //标题
            let ePostH3 = eP.children[2].innerText
            //日期
            let date = new Date(eP.children[0].innerText)
            let ePostDate = date.getFullYear() + '/' + (date.getMonth() < 10 ? '0' + (Number(date.getMonth()) + 1) : (Number(date.getMonth()) + 1)) + '/' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
            ajax('./essay/' + ePostDate + '/' + encodeURI(ePostH3) + '/context.html', writeEssay)
            // url斜杠！！！
            let state = {
                name: 'essayContext',
                scrollTop: document.documentElement.scrollTop,
                type: 'forward'
            }

           
            history.pushState(state, ePostH3, './essay/' + ePostDate + '/' + ePostH3 + '/')
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
function gallery_overlay() {
    // css hover冒泡问题
    $('#gallery').addEventListener('mouseenter', () => {
        for (let i = 0; i < $All('.gallery-link').length; i++) {
            $All('.gallery-link')[i].addEventListener('mouseenter', event => {
                event.target.children[0].style.display = 'block'
            })
            $All('.gallery-link')[i].addEventListener('mouseleave', event => {
                event.target.children[0].style.display = 'none'
            })

            //
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
                let dataHref = /gallery-title|gallery-description|gallery-tags/gm.test(event.target.className) ? event.target.parentNode.parentNode.getAttribute('data-href') : event.target.parentNode.getAttribute('data-href')
                let context = function (event) {
                    $('#galleryContext > div').innerHTML += this.responseText
                    $('title').innerText = dataHref.split('/').pop() + ' | Mianxiu\'s Blog...'
                }
                let state = {
                    name: 'galleryContext',
                    scrollTop: document.documentElement.scrollTop
                }
                ajax(dataHref + '/context.html', context)
                $('#gallery').style.display = 'none'
                $('#logo_other').style.display = 'none'
      
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

history.pushState({ name: 'home' }, '', '')
window.addEventListener("popstate", event => {
    if (history.state !== null) {
        switch (history.state.name) {
            case 'home':
                $('#logo_other').click()
                history.pushState({ name: 'home' }, '', '')
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
                document.documentElement.scrollTop = history.state.scrollTop
                break;
            case 'gallery':
                $('#gallery').style.display = ''
                $('#galleryContext > div').innerHTML = ''
                $('#logo_other').style.display = ''
                document.documentElement.scrollTop = history.state.scrollTop
                $('title').innerText = 'Mianxiu\'s Blog...'
                break;
            case 'essayContext':
                // 前进动作
                ajax(window.location.href + '/context.html', writeEssay)
                break;
            case 'galleryContext':
                ajax(window.location.href + '/context.html', function () {
                    $('#galleryContext > div').innerHTML += this.responseText         
                })
                $('#gallery').style.display = 'none'
                $('#logo_other').style.display = 'none'
                document.documentElement.scrollTop = 0
                $('title').innerText = decodeURI(window.location.href.slice(0,-1).split('/').pop()) + ' | Mianxiu\'s Blog...'
                break;
        }
    } else {
        $('#logo_other').click()
        $('title').innerText = 'Mianxiu\'s Blog...'
        history.pushState({ name: 'home' }, '', '')
    }

    //if(history.state.type === 'forward'){
    //    ajax(window.location.href + '/context.html',writeEssay)
    //}

});

