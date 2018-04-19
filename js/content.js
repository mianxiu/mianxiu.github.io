


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
    console.log(oReq.status)

    $('#ajaxProgress').style = 'height:100vh;background-color:rgba(0,0,0,0.5);'
    oReq.onprogress = function () {
        console.log('LOADING', oReq.status);

        $('#ajaxProgress').style = 'height:0vh;background-color:rgba(0,0,0,0);'
    }
    oReq.onload = run;
    oReq.send(null);

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
    switch (data_id) {
        case 'home':
            hidden('off')
            triangle()
            break;
        case 'gallery':
            hidden('on')
            break;
        case 'essay':
            hidden('on')
            essayAjax()
            break;
        case 'about':
            hidden('on')
            break;
    }
}


function navGetAjax() {
    //点击导航,然后ajax更改内容
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


//--------------------------------------------------------------------------------------------

/**
 * 相关函数(动画等)
 */
function triangle() {
    let R, G, B, RGB

    /**绘制矩形和返回一个imageData |
     * selector-需要绘制的图层的CSS selector
     * grid  [x,y,width,height,'fillStyle'],...[]
     * 
     * @param {String} selector 
     * @param {array} grid 
     */
    function rectAndGetData(selector, ...grid) {
        let d = $(selector)
        let d_ = d.getContext('2d')
        d_.clearRect(0, 0, d.width, d.height)
        for (i = 0; i < grid.length; i++) {
            d_.fillStyle = grid[i][4]
            d_.fillRect(grid[i][0], grid[i][1], grid[i][2], grid[i][3])
            d_.fill()
        }
        return d_.getImageData(0, 0, d.width, d.height)
    }


    /**绘制多点图形和返回一个imageData |
     * selector-需要绘制的图层的CSS selector |
     * grid [moveTo(x,y),...lineTo(x,y),'fillStyle','fill/stroke','globalCompositeOperation-Type',lineWidth,[translate:x,y]]...[]
     * 注意:绘制3点图形只需2组坐标，以此类推。因为最后会自动闭合
     * @param {String} selector
     * @param {array} grid 
     */
    function triangleAndGetData(selector, ...grid) {
        let t, t_

        if ($(selector) !== null) {

            t = $(selector)
            t_ = t.getContext('2d')

            t_.clearRect(0, 0, t.width, t.height)
            for (i = 0; i < grid.length; i++) {
                //混合模式，布尔运算等等
                t_.globalCompositeOperation = grid[i][grid[i].length - 3]

                t_.translate(grid[i][grid[i].length - 1][0], grid[i][grid[i].length - 1][1])

                t_.beginPath()
                t_.moveTo(grid[i][0][0], grid[i][0][1])

                for (j = 2; j < grid[i][0].length; j += 2) {

                    t_.lineTo(grid[i][0][j], grid[i][0][j + 1])
                }


                if (grid[i][grid[i].length - 4] === 'fill') {
                    t_.fillStyle = grid[i][grid[i].length - 5]
                    t_.fill()
                } else if (grid[i][grid[i].length - 4] === 'stroke') {
                    t_.lineWidth = grid[i][grid[i].length - 2]
                    t_.strokeStyle = grid[i][grid[i].length - 5]
                    t_.closePath()
                    t_.stroke()
                }
            }


        }


        //    return t_.getImageData(0,0,t.width,t.height)            

    }




    G = triangleAndGetData('#gray', [[47, 73, 176, 297, 377, 209], '#f2f2f2', 'fill', 'none', 0, [0, 0]])


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


    //1稍微的不规则移动点
    let p_0 = [60, 15, 155, 248, 404, 241]
    let p = getRandom([60, 15, 155, 248, 404, 241], [-1, 1])
    let p_t = p_0.slice()
    let p_num = 0
    function pointRandom() {
        let o = requestAnimationFrame(pointRandom)
        let p_a = 0
        let p_b = 0

        if ($('#triangle') === null) {
            cancelAnimationFrame(o)
        }
        //动画差值
        for (let k = 0; k < p.length; k++) {
            if (p_t[k] < p[k]) {
                p_t[k] += 0.06
            } else if (p_t[k] > p[k]) {
                p_t[k] -= 0.06
            }

        }

        //判断是否相同
        for (let a = 0; a < p_t.length; a++) {
            p_a += p[a]
            p_b += p_t[a]
        }

        //判断差值后的距离，重新random
        if (p_a < p_b) {
            p = getRandom([60, 15, 155, 248, 404, 241], [-1, 1])
        } else {
            p_num += 1
        }

        if (p_num > 100) {
            p = getRandom([60, 15, 155, 248, 404, 241], [-1, 1])
            p_num = 0
        }

        triangleAndGetData('#triangle', [p_t, 'black', 'stroke', 'none', 1, [0, 0]])
    }

    pointRandom()



    //2跟随鼠标的parallax动画
    function mouseTriangle() {
        clientW = document.body.clientWidth
        clientH = document.body.clientHeight
        let a_ = []
        window.addEventListener('mousemove', function (e) {
            //因为nav在左边，所以会有个初始margin，在css里添加避免突然位移

            if ($('#triangle') !== null) {
                easeMargin()
            }


            /**
             * 鼠标移出可视访问后,重新进入后margin变化过大导致类似卡顿的效果
             * 使用transition对margin进行插帧，chrome正常，Firefox因为margin数值变化过快导致失效，掉帧
             * 暂时解决方案:判断鼠标前后2个坐标，当差值过大，判断为是离开可视范围，添加transition进行插帧，反之去除
             */
            function easeMargin() {
                a_.push(e.clientX)
                b_ = a_.slice(-2)

                //判断前后值
                if (Math.abs(b_[0] - b_[1]) > 150) {

                    $('#triangle').style.transition = 'all 0.4s'
                    $('#gray').style.transition = 'all 0.4s'

                    if (b_[0] - b_[1] > 0) {
                        //settimeout是因为Firefox会因为值变化过快导致transition检测不到变化无法正常工作            
                        setTimeout(() => {
                            $('#triangle').style.marginLeft = -(clientW - b_[1]) * 0.05 + 'px'
                            $('#gray').style.marginLeft = (clientW - b_[1]) * 0.02 + 'px'
                        }, 300)

                    } else if (b_[0] - b_[1] < 0) {
                        setTimeout(() => {
                            $('#triangle').style.marginLeft = (clientW - b_[1]) * 0.05 + 'px'
                            $('#gray').style.marginLeft = -(clientW - b_[1]) * 0.02 + 'px'
                        }, 300)
                    }

                } else {
                    if (Math.abs(b_[0] - b_[1]) < 50) {
                        setTimeout(() => {
                            if ($('#h') !== null) {
                                $('#triangle').style.transition = ''
                                $('#gray').style.transition = ''
                            }
                        }, 10000)
                    }

                    e.clientX > clientW / 2 ? (
                        $('#gray').style.marginLeft = (clientW - e.clientX) * 0.05 + 'px',
                        $('#triangle').style.marginLeft = (e.clientX - clientW) * 0.02 + 'px'
                    ) : (
                            $('#gray').style.marginLeft = (clientW - e.clientX) * 0.05 + 'px',
                            $('#triangle').style.marginLeft = (e.clientX - clientW) * 0.02 + 'px')
                    e.clientY > clientH / 2 ? (
                        $('#gray').style.marginTop = (clientH - e.clientY) * 0.02 + 'px',
                        $('#triangle').style.marginTop = (e.clientY - clientH) * 0.005 + 'px'
                    ) : (
                            $('#gray').style.marginTop = (clientH - e.clientY) * 0.02 + 'px',
                            $('#triangle').style.marginTop = (e.clientY - clientH) * 0.005 + 'px')
                }

                if (a_.length > 100) {
                    a_ = []
                }
            }
        })
    }
    mouseTriangle()
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



//3 essay列表---------------------------------------------------------------------------

//获取内容
function essayAjax() {
    let originScroll = 0
    $('#essayLeft').addEventListener('click', e => {
        if (e.target.tagName === 'H3') {
            let eP = e.target.parentNode
            //标题
            let ePostH3 = eP.childNodes[1].innerText
            //日期
            let date = new Date(eP.childNodes[3].innerText)
            let ePostDate = date.getFullYear() + '/' + (date.getMonth() < 10 ? '0' + (Number(date.getMonth()) + 1) : (Number(date.getMonth()) + 1)) + '/' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
            ajax('./essay/' + ePostDate + '/' + encodeURI(ePostH3) + '/context.html', writeEssay)
            // url斜杠不能少！！！
            history.pushState(null, ePostH3, './essay/' + ePostDate + '/' + ePostH3 + '/')
            originScroll = document.documentElement.scrollTop
        }
    })



    let writeEssay = function () {
        document.documentElement.scrollTop = 0
        $('#essay').style.display = 'none'
        $('#essayText').style.height = '100vh'
        $('#essayText>div').style.marginTop = '30px'
        $('#navigation').style.filter = 'blur(4px)'
        $('#essayText>div').innerHTML = this.responseText
        $('#essayClose').style.transform = 'scale(1,1)'

        $('#essayClose').addEventListener('click', () => {
            history.pushState(null, "mianxiu's blog", '/')
            $('#essayClose').style.transform = ''
            $('#essay').style.display = ''
            $('#essayText').style.height = ''
            $('#essayText>div').style.marginTop = ''
            $('#navigation').style.filter = 'blur(0px)'
            $('#essayText>div').innerHTML = ''

            document.documentElement.scrollTop = originScroll
        })
    }

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

window.addEventListener('popstate', (e) => {
    var currentState = history.state;
    console.log(e)
})