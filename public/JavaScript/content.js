

 //  ajax()
 function ajax(url){
      var oReq = new XMLHttpRequest();
      oReq.open("get",url, true);
      oReq.send();
      return this.responseText
    }
    


    function navGetAjax(){
    //点击导航利用History API,然后ajax更改内容
    $('#navigation ul').addEventListener('click',function(e){
        if(e.target.tagName ==='A'){
            console.log(e.target)
            let u = '/' + e.target.innerText.toLowerCase()
            if(u !== '/home'){
                window.history.replaceState(null,null,u)  
                ajax(u)  
                      
                }
            }
        })


    }


    function writeContent(context){
        console.log(context)
    }