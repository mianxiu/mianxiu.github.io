
//
 //ajax()
 function ajax(url){
      var oReq = new XMLHttpRequest();
      oReq.onload = writeContent;
      oReq.open("get",url, true);
      oReq.send();
    
      
      //写入内容
      function writeContent(){
        console.log(this.responseText)
        $('#rule').innerText = '" '+this.responseText+' "'
        }
    }
    


    function navGetAjax(){
    //点击导航,然后ajax更改内容
    $('#navigation ul').addEventListener('click',function(e){
        if(e.target.tagName ==='A'){
            for(let i of $All('#navigation a')){
                i.className = ''
            }
            e.target.className = 'nav-active'
            let u = e.target.innerText.toLowerCase()
            if(u !== 'home'){
                //   window.history.replaceState(null,null,'/'+u)  
                ajax('public/navigation/'+u)      
            }else if (u ==='home'){
                $('#rule').innerText = '" to turning around..... "'
            }
                      
             
            }
        })


    }


   