
function UA(){
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|Android/i.test(ua)

    window.onload = function(){
        if (!isMobile) {
            mp3Player();
            nav()
        }
        navGetAjax()
        triangle()
        logo_other()
        listenEassyClose()
        updateLastPost()
        restoreRoute()
        if (window.hljs) {
            hljs.initHighlightingOnLoad();
        }
    }
}
UA()


/**
 * 等于document.querSelector
 * @param {*} dom 
 */
function $(dom) {
    return document.querySelector(dom)
}

/**
 * 等于document.querSelectorAll
 * @param {*} dom 
 */
function $All(dom) {
    return document.querySelectorAll(dom)
}


/**
 * 输入DOM对象，返回相对父元素的索引值
 * @param {*} childNode 
 */
function getIndex(childNode) {
    let p = childNode.parentNode
    let pChild = p.children
    for (i = 0; i < pChild.length; i++) {
        if (pChild[i] === childNode) {
            return i
        }
    }
}


/**
 * 对比数组，只有完全相等返回true
 * @param {array} a 
 * @param {array} b 
 */
function AryInclue(a, b) {
    let equal = 0
    if (a.length === b.length) {
        for (i = 0; i < b.length; i++) {
            if (a[i] === b[i]) {
                equal += 1
            } else {
                equal -= 1
            }
        }
    }

    if (equal === a.length) {
        return true
    } else {
        return false
    }
}



/**
* 输出歌曲数组
*/

function playListAry() {
    var URL = window.location.href.split(/\//)
    var domin = URL[0]+'//'+ URL[2]
    let playList = []
    let playPath = domin + '/music/'

    //for (const l of $('#playList>ol').children) {
    //    playList.push(playPath + l.innerText + '.mp3')
    //}
    for(let l =0;l<$('#playList>ol').children.length;l++){
        playList.push(playPath + $('#playList>ol').children[l].innerText + '.mp3')
    }
    return playList
}


    /**
     * 输入数组[],返回一个随机数组
     * randomNum-[min,max]
     * @param {array} array 
     * @param {array} randomNum
     */
    function getRandom(array, randomNum) {
        /**
     * -输入区间，返回随机数
     * @param {*} min 
     * @param {*} max 
     */
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }

        let a_ = []
        for (let i = 0; i < array.length; i++) {
            a_.push(array[i] + getRandomArbitrary(randomNum[0], randomNum[1]) * 20)
        }
        return a_
    }


/**
 * 导航栏
 */
function nav() {
    let navBlock = $('.nav-block')
    let navUl = $('#navigation ul')
    let navW = navUl.offsetWidth;
    let navQuarterW = navW / 5
    //位移动画
    navUl.addEventListener('mouseover', function (e) {
        let p = parseInt(navBlock.style.marginLeft.replace('px', ''))
        if (e.target.tagName === 'LI') {
            navBlock.style.marginLeft = (navQuarterW * (getIndex(e.target) + 1) - (0.48 * navQuarterW)) + 'px'
        }
    })


   /*
    window.onscroll = e=>{
        let sH = document.documentElement.scrollHeight
        let sT = document.documentElement.scrollTop
        let dH = document.documentElement.offsetHeight
        if(sH-sT < sH){
            $('#navigation').style.transform = 'translateY(-100px)'
          //  $('#navigation').style.filter = 'drop-shadow(1px 0px 8px red)'
        }else{
            $('#navigation').style.transform = 'translateY(0px)'
            
        }
    }
    */

}




//2 更改播放器样式
/**change mp3Player type
 *-normal and min
 * @param {*} type 
 */
function mp3PlayerType(type) {
    switch (type) {
        case 'normal':
            $('#mp3CSS').href = './css/mp3Player_normal.css'
            break;
        case 'min':
            $('#mp3CSS').href = './css/mp3Player_min.css'
            break;
    }
}


/**-是url
 *-run是函数
 *-默认传入this.responseText
 * @param {*} url 
 * @param {*} run 
 */
function ajax(url, run) {
    var oReq = new XMLHttpRequest();


    oReq.responseType = ''
    oReq.open("get", url, true);
    $('#ajaxProgress').style = 'height:100vh;background-color:rgba(0,0,0,0.5);'
    let finish = function () {
        $('#ajaxProgress').style = 'height:0vh;background-color:rgba(0,0,0,0);'
    }
    oReq.onload = function () {
        finish()
        if (oReq.status >= 200 && oReq.status < 300) {
            run.call(oReq)
        } else {
            console.error('Request failed:', oReq.status, url)
        }
    };
    oReq.onerror = function () {
        finish()
        console.error('Network error:', url)
    }
    oReq.ontimeout = finish
    oReq.send(null);

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

// logo_other 按钮
function logo_other() {
    $('#logo_other').addEventListener('click', () => {
        $('html').classList.remove('html-color')
        $('#rule').innerHTML = ''
        $('#index').style.display = 'block'
        $('#background-box').style.display = 'block'
        $('#logo_other').style.display = ''
        $('.footer').classList.remove('hidden')   
        mp3PlayerType('normal')
        navHidden('off')
        triangle()
        history.replaceState({ name: 'home' }, '', '/')
    })
}


/**
 * 从 Essay 和 Gallery 索引中找出最新发布日期并更新首页。
 */
async function updateLastPost() {
    let loadIndex = async function (url) {
        try {
            let response = await fetch(url, { cache: 'no-cache' })
            if (!response.ok) return null
            return new DOMParser().parseFromString(await response.text(), 'text/html')
        } catch (error) {
            console.error('Unable to update last post:', url, error)
            return null
        }
    }

    let [essayDocument, galleryDocument] = await Promise.all([
        loadIndex('/essay/index.html'),
        loadIndex('/gallery/index.html')
    ])
    let posts = []

    if (essayDocument) {
        for (let item of essayDocument.querySelectorAll('#essayLeft > ul > li')) {
            let dateNode = item.querySelector('._date')
            let titleNode = item.querySelector('.essay-title')
            let timestamp = dateNode ? Date.parse(dateNode.textContent.trim()) : NaN
            if (titleNode && !Number.isNaN(timestamp)) {
                posts.push({ type: 'ESSAY', title: titleNode.textContent.trim(), timestamp: timestamp })
            }
        }
    }

    if (galleryDocument) {
        for (let item of galleryDocument.querySelectorAll('.gallery-link')) {
            let path = item.getAttribute('data-href') || ''
            let dateMatch = path.match(/gallery\/(\d{4})\/(\d{2})\/(\d{2})\//)
            let titleNode = item.querySelector('.gallery-title')
            if (dateMatch && titleNode) {
                posts.push({
                    type: 'GALLERY',
                    title: titleNode.textContent.trim(),
                    timestamp: new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3])).getTime()
                })
            }
        }
    }

    if (posts.length === 0) return

    posts.sort((a, b) => b.timestamp - a.timestamp)
    let latest = posts[0]
    let latestDate = new Date(latest.timestamp)
    let dateText = [
        latestDate.getFullYear(),
        String(latestDate.getMonth() + 1).padStart(2, '0'),
        String(latestDate.getDate()).padStart(2, '0')
    ].join('.')
    let fields = $All('#lastPost > span')

    fields[1].innerText = dateText
}

