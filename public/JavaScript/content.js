
 //  ajax()

function ajax(){
    
    function reqListener () {
        console.log(this.responseText);
      }
      
      var oReq = new XMLHttpRequest();
      oReq.onload = reqListener;
      oReq.open("get", "about.html", true);
      oReq.send();
    }
    
