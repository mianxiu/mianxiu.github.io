

window.onload = function () {
    mp3Player();
}


function r() {
    var a = ['这是什么', '不会是真的吧', '开个玩乐', '无用功', '惨~~', 'surprise!!!', '........']
    getRandomInt = function (min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor((Math.random() * (max - min)) + min)
    }
    document.querySelector('button.k').innerText = a[getRandomInt(1, 5)]
}

//获取子元素相对父元素的索引值
function getIndex(childNode) {
    
    let p = childNode.parentNode
    let pChild = p.children
    for (i = 0; i < pChild.length; i++) {
        if (pChild[i] === childNode) {
            return i
        }

    }
}


//mp3播放器
function mp3Player() {
 
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var playList = []
    var playPath = 'public/music/'

    for (const l of document.querySelector('#playList').children) {
        playList.push( playPath + l.innerText + '.mp3')
    }

    var player = document.querySelector('#player')
    var source = audioCtx.createMediaElementSource(player);
    var analyser = audioCtx.createAnalyser()
    source.connect(analyser);
    analyser.connect(audioCtx.destination)

    //双击播放
    document.querySelector('#mp3Player').addEventListener('dblclick', function (db) {
        console.log(db)
     player.src = playList[getIndex(db.path[0])]

    })


    function visual(){
    //可视化频谱
    var canvas = document.querySelector('#visual')
    var canvasCtx = canvas.getContext("2d")
    //canvas画布大小
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    analyser.minDecibels = -90;
    analyser.maxDecibles = -10;

    //时域数据？
    //频谱FFT的大小，越大分析能力越强
    analyser.fftSize = 256;
    //获取长度
    var bufferLength = analyser.frequencyBinCount;

    console.log(bufferLength);
    //转化为数组
    var dataArray = new Uint8Array(bufferLength);

   
    function draw(){
        //requestAnimationFrame可以在浏览器页面不刷新是重复绘制页面
        drawVisual = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray)
        canvasCtx.clearRect(0,0,WIDTH,HEIGHT)
    
        var barWidth = (WIDTH/bufferLength)*2.5
        var barHeight,x = 0
        
        //绘制
        for(i=0;i<bufferLength;i++){
            
            barHeight = dataArray[i]/2
            canvasCtx.fillStyle = 'blue';
            canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
        
            x += barWidth + 1;
        }

    }
         draw()
    }
    
    visual()



    //默认音源
    //循环播放列表
    player.src = playList[0]
    player.onended = function () {
        console.log('下一曲')
        let host = decodeURI(player.src).replace(window.location.href, '')
        let e = playList.indexOf(host)
        if (e + 1 < playList.length) {
            return player.src = playList[e + 1]
        } else {
            return player.src = playList[0]
        }
    }


    
}