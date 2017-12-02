
//
//ajax()
function ajax(url) {
    var oReq = new XMLHttpRequest();
    oReq.onload = writeContent;
    oReq.open("get", url, true);
    oReq.send();


    //写入内容
    function writeContent() {
        console.log(this.responseText)
        $('#rule').innerHTML = '" ' + this.responseText + ' "'

        triangle()
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
            //   window.history.replaceState(null,null,'/'+u)  
            ajax('public/navigation/' + u+'.html')
        }
    })
}


//----------------------------------------
//1. home 相关函数
function triangle(){
    let triCtx = $('#triangle').getContext('2d')

    triCtx.beginPath()
    triCtx.arc(0,0,100,0,180)
    triCtx.fillStyle = 'blue'
    triCtx.fill()

    console.log(triCtx.createImageData(550, 364)); 
}