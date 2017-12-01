

 //  ajax()
 function ajax(url){
      var oReq = new XMLHttpRequest();
      oReq.onload = writeContent(this.responseText);
      oReq.open("get",url, true);
      oReq.send();
    }
    


    function navGetAjax(){
    //点击导航利用History API,然后ajax更改内容
    $('#navigation ul').addEventListener('click',function(e){
        if(e.target.tagName ==='A'){
            console.log(e.target)
            let u = '/' + e.target.innerText.toLowerCase()
            if(u !== '/home'){
                window.history.pushState(null,null,u)  
                let o = ajax(u)  
                console.log(o)            
                }
            }
        })


    }


    function writeContent(context){
        console.log(context)
    }