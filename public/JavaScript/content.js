

 //  ajax()
 function ajax(url){
    
    function reqListener () {
        console.log(this.responseText);
      }
      
      var oReq = new XMLHttpRequest();
      oReq.onload = reqListener;
      oReq.open("get",url, true);
      oReq.send();
    }
    


    //点击导航利用History API,然后ajax更改内容
    navUl.addEventListener('click',function(e){
        if(e.target.tagName ==='A'){
            console.log(e.target)
            let u = '/' + e.target.innerText.toLoweCase()
            window.history.pushState(null,null,u)

            console.log(ajax(u+'.html'))
            
        }
    })



