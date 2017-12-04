
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


//--------------------------------------------------------------------------------------------
//1. home 相关函数

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
            d_.clearRect(0,0,d.width,d.height)
        for (i = 0; i < grid.length; i++) {
            d_.fillStyle = grid[i][4]
            d_.fillRect(grid[i][0], grid[i][1], grid[i][2], grid[i][3])
            d_.fill()
        }
        return d_.getImageData(0, 0, d.width, d.height)
    }
    

    /**绘制多点图形和返回一个imageData |
     * selector-需要绘制的图层的CSS selector |
     * grid [moveTo(x,y),...lineTo(x,y),'fillStyle','fill/stroke',[translate:x,y]]...[]
     * 注意:绘制3点图形只需2组坐标，以此类推。因为最后会自动闭合
     * @param {String} selector
     * @param {array} grid 
     */
    function triangleAndGetData(selector,...grid){
        let t = $(selector)
        let t_ = t.getContext('2d')
            t_.clearRect(0,0,t.width,t.height)


            for(i = 0;i<grid.length;i++){
                t_.translate(grid[i][grid[i].length-1][0],grid[i][grid[i].length-1][1])
                t_.beginPath()
                t_.moveTo(grid[i][0],grid[i][1])         

                for(j=2; j<grid[i].length-2; j+=2){
                 
                    t_.lineTo(grid[i][j],grid[i][j+1])
                }
                t_.fillStyle = grid[i][grid[i].length-3]
                if(grid[i][grid[i].length-2] ==='fill'){               
                    t_.fill()
                }else if(grid[i][grid[i].length-2] ==='stroke'){               
                    t_.closePath()
                    t_.stroke()
                }   
            }

            return t_.getImageData(0,0,t.width,t.height)            
            
    }


  RT = triangleAndGetData('#red',[22,29,153,254,357,167,'red','fill',[0,0]])
  GT = triangleAndGetData('#red',[140,9,153,254,357,167,'lime','fill',[10,40]])
  BT = triangleAndGetData('#red',[100,59,153,254,357,167,'blue','fill',[20,20]])
  WT = rectAndGetData('#rgb',[0,0,1016,342,'white'])
  let rgba = $('#rgb')
  Difference(rgba,[RT,GT,BT,WT])
  


 //   R = rectAndGetData('#red', [0, 10, 40, 40, 'red'])
 //   G = rectAndGetData('#green', [10, 10, 40, 40, 'Lime'])
 //   B = rectAndGetData('#blue', [20, 10, 40, 40, 'blue'])    
 //   W = rectAndGetData('#rgb', [0, 0, 100, 100, 'white'])   
    

   
  
    let num = 1
    function testA(){
    let o = requestAnimationFrame(testA)
    
    
        R = rectAndGetData('#red', [0, 10, 40, 40, 'red'])
        G = rectAndGetData('#green',[10,num, 40, 40, 'Lime'])
        B = rectAndGetData('#blue', [20, 10, 40, 40, 'blue'])  
        W = rectAndGetData('#rgb', [0, 0, 100, 100, 'white']) 
        Difference(rgba,[R,G,B,W])
        console.log(num)
        num++

        if(num > 60){
            cancelAnimationFrame(o)
        }
       // cancelAnimationFrame(o)
    
    }
  

    

    /**drawSelector-最终绘制的 element 对象 |
     * layer [imageData,..] 需要叠加的层
     * @param {Object} drawSelector 
     * @param {array} layer 
     */
    function Difference(drawSelector, layer) {
        RGB = drawSelector.getContext('2d').getImageData(0,0,drawSelector.width, drawSelector.height)
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

        }else {
            console.log('参数 ImageData')
        }

        drawSelector.getContext('2d').putImageData(RGB,0,0)
    }
    
}

