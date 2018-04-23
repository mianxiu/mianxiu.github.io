
// ajax同目录内容
(() => {
    document.querySelector('title').innerText = decodeURI(window.location.href.split(/\//)[7])
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {

        document.documentElement.scrollTop = 0
        document.querySelector('#essayText>div').innerHTML = this.responseText
        document.querySelector('#essayClose').style.transform = 'scale(1,1)'
        document.querySelector('#main').style = 'display:flex;justify-content:center;height:100vh;'
        document.querySelector('#essayClose').addEventListener('click', () => {
        document.querySelector('#essayClose').style.transform = ''  
        window.location.href = '/'
        })
    }
    oReq.responseType = ''
    oReq.open("get", './context.html', true);
    oReq.send();
})()