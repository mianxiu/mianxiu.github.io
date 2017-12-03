
//
//ajax()
function ajax(url) {
    var oReq = new XMLHttpRequest();
    oReq.onload = writeContent;
    oReq.open("get", url, true);
    oReq.send();

    console.log(url)

    //写入内容
    function writeContent() {
        console.log(this.responseText)

        $('#rule').innerHTML = this.responseText
        let data_id = $('#rule').dataset.id
        if (data_id === 'home') {
            triangle()
        }
        else if (data_id === 'gallery') {

        }
        else if (data_id === 'essay') {

        }
        else if (data_id === 'about') {

        }

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
            ajax('public/navigation/' + u + '.html')
        }
    })
}


//----------------------------------------
//1. home 相关函数
function triangle() {
    let R, G, B, RGB

    /**selector 
     * grid  [x,y,width,height,'fillStyle'],...[]
     * draw Rectangular and return imageData
     * 
     * @param {*} selector 
     * @param {*} grid 
     */
    function rectAndGetData(selector, ...grid) {
        let d = $(selector)
        let d_ = d.getContext('2d')

        for (i = 0; i < grid.length; i++) {
            d_.fillStyle = grid[i][4]
            d_.fillRect(grid[i][0], grid[i][1], grid[i][2], grid[i][3])
            d_.fill()
        }
        return d_.getImageData(0, 0, d.width, d.height)
    }


    R = rectAndGetData('#red', [0, 10, 20, 20, 'red'])
    G = rectAndGetData('#green', [5, 10, 20, 20, 'Lime'])
    B = rectAndGetData('#blue', [10, 10, 20, 20, 'blue'])
    W = rectAndGetData('#rgb',[0,0,100,100,'white'])




    let rgba = $('#rgb').getContext('2d')

    /**
     * 
     * @param {*} drawSelector 
     * @param {*} width 
     * @param {*} height 
     * @param {*} layer 
     */
    function Difference(drawSelector, width, height, layer) {
        RGB = drawSelector.getImageData(0,0,width, height)
        //混合模式-差值
        //计算公式为 绝对值|n层-(n-1)层|
        //重合部分 判断所有层透明度相加 > 0 ? 赋值255 ： 复制 0

        if (layer.length < 2) {
            for (i = 0; i < RGB.data.length; i += 4) {
                RGB.data[i] = Math.abs(layer[0].data[i])
                RGB.data[i + 1] = Math.abs(layer[0].data[i + 1])
                RGB.data[i + 2] = Math.abs(layer[0].data[i + 2])
                RGB.data[i + 3] = Math.abs(layer[0].data[i + 3])
                
            }
            
        }
        else if (layer.length < 3) {
            for (i = 0; i < RGB.data.length; i += 4) {
                RGB.data[i] = Math.abs(layer[0].data[i] - layer[1].data[i])
                RGB.data[i + 1] = Math.abs(layer[0].data[i + 1] - layer[1].data[i + 1])
                RGB.data[i + 2] = Math.abs(layer[0].data[i + 2] - layer[1].data[i + 2])
                
                //判断透明度
                layer[0].data[i + 3] +  layer[1].data[i + 3] > 0 ?   RGB.data[i + 3] = 255 :  RGB.data[i + 3] = 0
               
            }
            
        }
        else if (layer.length >= 3) {
            for (i = 0; i < RGB.data.length; i += 4) {
                for (j = 0; j < layer.length; j++) {
                    if (j < 1) {
                        RGB.data[i] = Math.abs(layer[j].data[i] - layer[j + 1].data[i])
                        RGB.data[i + 1] = Math.abs(layer[j].data[i + 1] - layer[j + 1].data[i + 1])
                        RGB.data[i + 2] = Math.abs(layer[j].data[i + 2] - layer[j + 1].data[i + 2])

                        layer[0].data[i + 3] +  layer[1].data[i + 3] > 0 ?   RGB.data[i + 3] = 255 :  RGB.data[i + 3] = 0

                    } else if (j > 1) {
                        RGB.data[i] = Math.abs(Math.abs(RGB.data[i] - layer[j].data[i]))
                        RGB.data[i + 1] = Math.abs(Math.abs(RGB.data[i + 1] - layer[j].data[i + 1]))
                        RGB.data[i + 2] = Math.abs(Math.abs(RGB.data[i + 2] - layer[j].data[i + 2]))

                        RGB.data[i + 3] + layer[j].data[i + 3] > 0 ?   RGB.data[i + 3] = 255 :  RGB.data[i + 3] = 0
                    }
                }
            }

        }

        drawSelector.putImageData(RGB, 0, 0)
    }

    Difference(rgba, 100, 100, [R,G,B])
}
