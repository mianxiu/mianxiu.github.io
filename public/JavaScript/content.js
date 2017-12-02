
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
        let data_id =  $('#rule').dataset.id
        if(data_id === 'home' ){
            triangle()
        }
        else if(data_id === 'gallery'){

        }
        else if(data_id === 'essay'){

        }
        else if(data_id === 'about'){

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
            ajax('public/navigation/' + u +'.html')
        }
    })
}


//----------------------------------------
//1. home 相关函数
function triangle(){
    let R,G,B,RGB

    function drawAndGetData(x,y,width,height,fillStyle,dom) {  }



    function r(x,y,width,height){
        let dom = $('#red')
        let r = dom.getContext('2d')
      
        r.fillStyle = "red"
        r.fillRect(x,y,width,height)
        r.fill()
        R = r.getImageData(0,0,dom.width,dom.height)
      
    }
    r(0,10,20,20)

    function g(x,y,width,height){
        let dom = $('#green')
        let g = dom.getContext('2d')
     
        g.fillStyle = "Lime"
        g.fillRect(x,y,width,height)
        g.fill()
        G = g.getImageData(0,0,dom.width,dom.height)
      
    }
    g(5,10,20,20)

    function b(x,y,width,height){
        let dom = $('#blue')
        let b = dom.getContext('2d')
    
        b.fillStyle = "blue"
        b.fillRect(x,y,width,height)
        b.fill()
        return b.getImageData(0,0,dom.width,dom.height)
       
    }
    B = b(10,10,20,20)

    function rgb(){
        let dom = $('#rgb')
        let rgb = dom.getContext('2d')
        rgb.fillStyle="white"
        rgb.fillRect(0,0,100,100)
        rgb.fill()
        RGB = rgb.getImageData(0,0,dom.width,dom.height)
    }
    rgb()

    function Difference(){
        //差值，假如背景透明，计算后无法填充,所以需要一个白底背景层
        //计算公式为 绝对值|n层-(n-1)层|
        for(i=0;i<RGB.data.length;i+=4){
            RGB.data[i] = Math.abs(Math.abs(Math.abs(R.data[i]-G.data[i])-B.data[i])-RGB.data[i])
            RGB.data[i+1] = Math.abs(Math.abs(Math.abs(R.data[i+1]-G.data[i+1])-B.data[i+1])-RGB.data[i+1])
            RGB.data[i+2] = Math.abs(Math.abs(Math.abs(R.data[i+2]-G.data[i+2])-B.data[i+2])-RGB.data[i+2])

        }
   
        let rgba = $('#rgb').getContext('2d')
        rgba.putImageData(RGB,0,0)        
    }
    Difference()


}
