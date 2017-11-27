

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
        playList.push(playPath + l.innerText + '.mp3')
    }

    var player = document.querySelector('#player')
    var source = audioCtx.createMediaElementSource(player);
    var analyser = audioCtx.createAnalyser()
    source.connect(analyser);
    analyser.connect(audioCtx.destination)


    //------------------------------------------------------//
    //播放器相关
    function control() {
        let p = document.querySelector('#mp3Player')
        let pl = document.querySelector('#playList')
        let pCtr = document.querySelector('#playCtr')

        //播放列表双击歌曲播放
        pl.addEventListener('dblclick', function (db) {
            player.src = playList[getIndex(db.target)]

        })

        //暂停/播放
        pCtr.onclick = function (e) {
            if (player.paused == false) {
                //绘制暂停按钮
                player.pause()

            } else if (player.paused == true) {
                player.play()
            }
        }
    }

    control()


    //暂停/播放icon
    function playPauseIcons(){
        let canvasPC = document.querySelector('#playCtr')
        let canvasPCCtx = canvasPC.getContext('2d')
      

        //4点多边形简单变形绘制
        function drawIcon(oX1, oY2,fillStyle, Ctx, drawNum) {
            /**
             * oX1,oY2是需要绘制形状的坐标点
             * fillStyle是填充样式的数组
             * ctx是canvas
             * drawNum是同一画布绘制的图形个数
             */

            for (n = 1; n <= drawNum; n++) {
                for (i = 0; i < 1; i++) {
                    let a = 0 + (n - 1) * 4
                    let b = 1 + (n - 1) * 4
                    let c = 2 + (n - 1) * 4
                    let d = 3 + (n - 1) * 4
                    Ctx.beginPath();
                    //绘制原点
                    Ctx.moveTo(oX1[a], oY2[a])
                    Ctx.lineTo(oX1[b], oY2[b])
                    Ctx.lineTo(oX1[c], oY2[c])
                    Ctx.lineTo(oX1[d], oY2[d])
                    Ctx.closePath();
                    Ctx.fillStyle = fillStyle[n-1]
                    Ctx.fill();
                }
             
            }

        }
        //播放icon
     //   drawIcon([0, 0, 22, 22, 22, 22, 31, 41], [0, 48, 28, 6, 6, 28, 20, 11],['blue','red'], canvasPCCtx, 2)
        //暂停icon----------------
     //   drawIcon([0, 8, 20, 8, 18, 30, 38, 30], [14, 50, 45, 11, 6, 40, 36, 0],['black','yellow'], canvasPCCtx, 2)


     let x1 = [0, 0, 22, 22, 22, 22, 31, 41]
     let x2 = [0, 8, 20, 8, 18, 30, 38, 30]
     let y1 = [0, 48, 28, 6, 6, 28, 20, 11]
     let y2 = [14, 50, 45, 11, 6, 40, 36, 0]

        function iconMotion(){
           requestAnimationFrame(iconMotion)
        
           let x = [],y = []
           for(p=0;p<x1.length;p++){  
             x.push(x1[p]-x2[p])
             y.push(y1[p]-y2[p])
           }

           //x
           for(m=0;m<x.length;m++){
                if(x[m]>0 && x1[m]>=x2[m]){  
                    x1[m] -= 1
                }else if(x[m]<0 && x1[m]<=x2[m]){
                    x1[m] +=1
                }else{
                }
           }

           //y
           for(m=0;m<y.length;m++){
            if(y[m]>0 && y1[m]>=y2[m]){  
                y1[m] -= 1
            }else if(y[m]<0 && y1[m]<=y2[m]){
                y1[m] +=1
            }else{
            }
       }
           //绘制
           canvasPCCtx.clearRect(0,0,50,50)
           drawIcon(x1,y1,['blue','red'], canvasPCCtx, 2)
         
        }
        iconMotion()

    }
    playPauseIcons()


    //进度条
    //时间
    //toFixed()保留小数
    function AudioProgress() {
        let canvasPB = document.querySelector('#audioProgressB') 
        let canvasPCtxB = canvasPB.getContext("2d")
        player.onloadedmetadata = function () {
       
            //加载歌曲后开始绘制
            //黑色
            canvasPCtxB.fillStyle = "black"
            canvasPCtxB.fillRect(0, 0, 120, 6)
            //黄色
            canvasPCtxB.fillStyle = "rgb(252,171,29)"
            canvasPCtxB.fillRect(0, 0, 12, 6)
            //蓝色
            canvasPCtxB.fillStyle = "rgb(112,160,219)"
            canvasPCtxB.fillRect(12, 0, 12, 6)

            let pd = player.duration
            let i = pd / 120

            //减少层    
            player.addEventListener('timeupdate', function () {
                let pc = player.currentTime
                //绘制进度条 
                document.querySelector('#audioProgressA').style = 'margin-left:'+pc/i+'px;width:'+(120-pc/i)+'px'
                
                //歌曲播放时间
                document.querySelector('#timePass').innerText = ((pd - pc) / 60).toFixed(2).replace(/\./, ':')
            })
        }

    }
    AudioProgress()

    //------------------------------------------------------//
    //可视化频谱
    function visual() {

        let canvas = document.querySelector('#visual')
        let canvasCtx = canvas.getContext("2d")
        //canvas画布大小
        WIDTH = canvas.width;
        HEIGHT = canvas.height;

        analyser.minDecibels = -90;
        analyser.maxDecibles = -10;

        //时域数据？
        //analyser读取的数据都是连续的
        //频谱FFT的大小，越大分析能力越强
        analyser.fftSize = 32;
        //获取1/2长度
        var bufferLength = analyser.frequencyBinCount;

        //转化为数组最大高度128
        var dataArray = new Uint8Array(bufferLength);
        
        canvasCtx.fillStyle = 'black'; 
      
        function draw() {
            analyser.getByteFrequencyData(dataArray)
            //requestAnimationFrame可以在浏览器页面不刷新是重复绘制页面
            //页面完成时可以考虑把宽度写定值,降低性能要求
            //减少canvas API调用
            requestAnimationFrame(draw)
            canvasCtx.clearRect(0, 0,200, 100)
            var barHeight, x = 0

            //绘制            
            for (i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] 
                canvasCtx.fillRect(x,Math.floor(100-barHeight/4), 6, 100);
               // x += barWidth + 1;
                x +=7
            }

        }

        draw()
    }

    visual()


    //------------------------------------------------------//
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