
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
    
ajax('about.html')