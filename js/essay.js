let u = window.location.href
let uSplit = u.split(/\//)
ajax('/',function(){console.log(document.querySelector('html').innerHTML = this.responseText)})
history.replaceState(null,null,'/')
setTimeout(()=>{
//document.querySelector('#navigation > ul:nth-child(2) > li:nth-child(4) > a').click()
ajax('./essay/pages/1/index.html', function () { $('#essayLeft > ul').innerHTML = this.responseText })
ajax('./essay/'+ uSplit[4]+'/'+uSplit[5]+'/'+uSplit[6]+'/'+uSplit[7],function(){console.log(document.querySelector('html').innerHTML = this.responseText)})
history.replaceState(null,null,'./essay/'+ uSplit[4]+'/'+uSplit[5]+'/'+uSplit[6]+'/'+uSplit[7])
},2000)