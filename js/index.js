function UA(){
    ua = navigator.userAgent;
    if(ua.match(/iPhone|Android/i)){
        $('#pageCSS').href = './css/mobile.css'
        /*mobile.js*/
        window.onload = function(){
            navGetAjax()
            triangle()   
        }      
    }else{
        window.onload = function(){        
            mp3Player();
            nav()
            navGetAjax()
            triangle()          
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



function r() {
    var a = ['这是什么', '不会是真的吧', '开个玩乐', '无用功', '惨~~', 'surprise!!!', '........']
    getRandomInt = function (min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor((Math.random() * (max - min)) + min)
    }
    $('button.k').innerText = a[getRandomInt(1, 5)]
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
    let navQuarterW = navW / 5
    //位移动画
    navUl.addEventListener('mouseover', function (e) {
        let p = parseInt(navBlock.style.marginLeft.replace('px', ''))
        if (e.target.tagName === 'LI') {
            navBlock.style.marginLeft = (navQuarterW * (getIndex(e.target) + 1) - (0.48 * navQuarterW)) + 'px'
        }
    })

    //指示复位
    let navA = $All('#navigation  a')
    let navSpan = $All('.nav-span')

    navUl.addEventListener('mouseleave', function () {
        let o = getIndex($('.nav-active').parentNode)
        navBlock.style.marginLeft = (navQuarterW * (o + 1) - (0.48 * navQuarterW)) + 'px'
    })

    navUl.addEventListener('click', (e) => {
        for (p of navSpan) {
            p.style = ''
        }
        if (e.target.tagName === 'A') {
            navSpan[getIndex(e.target.parentNode)].style = 'opacity:1;margin-top:10px;'
        }
    })


    /*检测页面滚动*/
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

}


//
function mobile(){
    
}

