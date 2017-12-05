
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
     * grid [moveTo(x,y),...lineTo(x,y),'fillStyle','fill/stroke','globalCompositeOperation-Type',lineWidth,[translate:x,y]]...[]
     * 注意:绘制3点图形只需2组坐标，以此类推。因为最后会自动闭合
     * @param {String} selector
     * @param {array} grid 
     */
    function triangleAndGetData(selector,...grid){
        let t = $(selector)
        let t_ = t.getContext('2d')
            t_.clearRect(0,0,t.width,t.height)

           
            for(i = 0;i<grid.length;i++){
                //混合模式，布尔运算等等
                t_.globalCompositeOperation = grid[i][grid[i].length-3]

                t_.translate(grid[i][grid[i].length-1][0],grid[i][grid[i].length-1][1])

                t_.beginPath()
                t_.moveTo(grid[i][0][0],grid[i][0][1])         

                for(j=2; j<grid[i][0].length; j+=2){
                 
                    t_.lineTo(grid[i][0][j],grid[i][0][j+1])
                }


                if(grid[i][grid[i].length-4] ==='fill'){    
                    t_.fillStyle = grid[i][grid[i].length-5]
                    t_.fill()
                }else if(grid[i][grid[i].length-4] ==='stroke'){    
                    t_.lineWidth = grid[i][grid[i].length-2]   
                    t_.strokeStyle = grid[i][grid[i].length-5]
                    t_.closePath()
                    t_.stroke()
                }   
            }

        //    return t_.getImageData(0,0,t.width,t.height)            
            
    }


    


    
  G = triangleAndGetData('#gray',[[47,73,176,297,377,209],'#f2f2f2','fill','none',0,[0,0]])
  
  
//43,5,155,248,404,241
let y0 = 45



/**
 * 输入数组[],返回一个随机数组
 * randomNum-[min,max]
 * @param {array} array 
 * @param {array} randomNum
 */
    function getRandom(array,randomNum) {
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
            a_.push(array[i] + getRandomArbitrary(randomNum[0],randomNum[1]) * 20)
        }

        return a_
    }


    let p_0 = [43,5,155,248,404,241]
    let p = getRandom([43,5,155,248,404,241],[-1,1])
    let p_t = p_0.slice()
    let p_num = 0
    function test(){
        let o = requestAnimationFrame(test)
        let p_a= 0
        let p_b = 0
      
        if($('#triangle')===null){
            cancelAnimationFrame(o)
        }
        //动画差值
        for(let k =0;k<p.length;k++){
           if(p_t[k]<p[k]){
            p_t[k]+=0.04             
           }else if(p_t[k]>p[k]){
            p_t[k]-=0.04
           }
           
        }

        //判断是否相同
        for(let a =0;a<p_t.length;a++){
                p_a+=p[a]
                p_b+=p_t[a]
        }

        //判断差值后的距离，重新random
        if(p_a<p_b){
            p = getRandom([43,5,155,248,404,241],[-1,1])
        }else{
            p_num+=1
        }

        if(p_num>100){
            p = getRandom([43,5,155,248,404,241],[-1,1])
            p_num = 0
        }
      
        triangleAndGetData('#triangle',[p_t,'black','stroke','none',1,[0,0]])
       
        
    }
    
        test()
   
    
  



    function mouseTriangle(){
        clientW = document.body.clientWidth
        clientH = document.body.clientHeight
        
            window.addEventListener('mousemove',function(e){
               
                if($('#triangle')!==null){
                e.clientX > clientW/2 ? $('#gray').style.marginLeft = (clientW - e.clientX)*0.05+'px' : $('#gray').style.marginLeft = (clientW - e.clientX)*0.05+'px'
                e.clientY > clientH/2 ? $('#gray').style.marginTop = (clientH - e.clientY)*0.02+'px' : $('#gray').style.marginTop = (clientH - e.clientY)*0.02+'px'
                e.clientX > clientW/2 ? $('#triangle').style.marginLeft = (e.clientX - clientW)*0.08+'px' : $('#triangle').style.marginLeft = (e.clientX - clientW )*0.08+'px'
                e.clientY > clientH/2 ? $('#triangle').style.marginTop = (e.clientY - clientH)*0.04+'px' : $('#triangle').style.marginTop = (e.clientY - clientH )*0.04+'px'
                }
            })

    
    }
    mouseTriangle()
}