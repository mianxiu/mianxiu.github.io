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
                            $('#triangle').style.marginLeft = -(clientW - b_[1]) * 0.05 / htmlFontSize + 'rem'
                            $('#gray').style.marginLeft = (clientW - b_[1]) * 0.02 / htmlFontSize + 'rem'
                        }, 300)

                    } else if (b_[0] - b_[1] < 0) {
                        setTimeout(() => {
                            $('#triangle').style.marginLeft = (clientW - b_[1]) * 0.05 / htmlFontSize + 'rem'
                            $('#gray').style.marginLeft = -(clientW - b_[1]) * 0.02 / htmlFontSize + 'rem'
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
                        $('#gray').style.marginLeft = (clientW - e.clientX) * 0.05 / htmlFontSize + 'rem',
                        $('#triangle').style.marginLeft = (e.clientX - clientW) * 0.02 / htmlFontSize + 'rem'
                    ) : (
                            $('#gray').style.marginLeft = (clientW - e.clientX) * 0.05 / htmlFontSize + 'rem',
                            $('#triangle').style.marginLeft = (e.clientX - clientW) * 0.02 / htmlFontSize + 'rem')
                    e.clientY > clientH / 2 ? (
                        $('#gray').style.marginTop = (clientH - e.clientY) * 0.02 / htmlFontSize + 'rem',
                        $('#triangle').style.marginTop = (e.clientY - clientH) * 0.005 / htmlFontSize + 'rem'
                    ) : (
                            $('#gray').style.marginTop = (clientH - e.clientY) * 0.02 / htmlFontSize + 'rem',
                            $('#triangle').style.marginTop = (e.clientY - clientH) * 0.005 / htmlFontSize + 'rem')
                }

                if (a_.length > 100) {
                    a_ = []
                }
            }
        })
    }
    mouseTriangle()
}
