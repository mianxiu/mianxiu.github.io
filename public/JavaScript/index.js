

window.onload = function () {

    mp3Player();

    nav()


}



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



function r() {
    var a = ['这是什么', '不会是真的吧', '开个玩乐', '无用功', '惨~~', 'surprise!!!', '........']
    getRandomInt = function (min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor((Math.random() * (max - min)) + min)
    }
    $('button.k').innerText = a[getRandomInt(1, 5)]
}





//域名的正则，用于匹配歌曲
var musicRegex = new RegExp(/.*mianxiu\.github\.io\//)

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


/**获取cookie
 * 返回一个cookieName:value的对象
 */
function getCookie() {
    let r = new RegExp(/=/)
    let c = []
    let u = document.cookie
    if (/;/.test(u)) {
        ua = u.split(/;\s/)
        let co = new Object()
        for (let i of ua) {
            cn = i.split(r)[0]
            cv = i.split(r)[1]
            co[cn] = cv
        }
        return co
    } else {
        let co = new Object()
        cn = u.split(r)[0]
        cv = u.split(r)[1]
        co[cn] = cv
        return co
    }
}



/**
* 输出歌曲数组
*/
function playListAry() {
    let playList = []
    let playPath = 'public/music/'

    for (const l of $('#playList>ol').children) {
        playList.push(playPath + l.innerText + '.mp3')
    }

    return playList
}




/**
 * 导航栏
 */
function nav() {
    let navBlock = $('.nav-block')
    let navUl = $('#navigation ul')
    let navW = navUl.offsetWidth;
    let navQuarterW = navW / 4
    //位移动画
    navUl.addEventListener('mouseover', function (e) {
        let p = parseInt(navBlock.style.marginLeft.replace('px', ''))
        if (e.target.tagName === 'LI') {
            navBlock.style.marginLeft = (navQuarterW * (getIndex(e.target) + 1) - (0.48 * navQuarterW)) + 'px'
        } else {

        }

    })

    //指示
    let navSpan = $All('.nav-span')
    let liAry = []
    for (let i of $All('#navigation ul li a')) {
        liAry.push(i.href.replace(musicRegex, ''))
    }
    let n = liAry.indexOf(window.location.href.replace(musicRegex, ''))
    function marginL() {
        if (n === -1) {
            navBlock.style.marginLeft = 0.48 * navQuarterW + 'px'
            navSpan[0].style.marginTop = 0.08 * navQuarterW + 'px'
            navSpan[0].style.opacity = 1;
        } else {
            navBlock.style.marginLeft = (navQuarterW * (n + 1)) - (0.48 * navQuarterW) + 'px'
            navSpan[n].style.marginTop = 0.08 * navQuarterW + 'px'
            navSpan[n].style.opacity = 1;
        }

    }
    marginL()
    //监听复位
    navUl.addEventListener('mouseleave', function (e) {
        marginL()
    })

}










/**
 * 把歌曲序号+时间写入cookie
 */
function currentTime() {
    let p = playListAry()
    let t = $('#playList>ol')
    if (document.cookie !== "") {
        $('#player').currentTime = getCookie().currentTime
        $('#player').src = p[getCookie().songNum]
        t.style.marginTop = -getCookie().songNum * (t.offsetHeight / p.length) + 'px'
    }

    $('#navigation').addEventListener('click', function () {

        let c = 'currentTime=' + $('#player').currentTime
        let d = decodeURI($('#player').src).replace(musicRegex, '')

        let n = 'songNum=' + p.indexOf(d)
        document.cookie = c
        document.cookie = n
    })
}



