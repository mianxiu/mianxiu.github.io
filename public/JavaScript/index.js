

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
        var p = document.querySelector('#mp3Player')
        var pl = document.querySelector('#playList')
        var pCtr = document.querySelector('#playCtr')

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


    //进度条
    //时间
    //toFixed()保留小数
    function AudioProgress() {
        let canvasPA = document.querySelector('#audioProgressA')
        let canvasPB = document.querySelector('#audioProgressB')
        let canvasPCtxA = canvasPA.getContext("2d")
        let canvasPCtxB = canvasPB.getContext("2d")

        player.onloadedmetadata = function () {
            setTimeout(()=>{
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
            //减少层    
            canvasPCtxB.save()
            },1000)
            
            let pd = player.duration
            let i = pd / 120

            player.addEventListener('timeupdate', function () {
                let pc = player.currentTime
                //绘制进度条 
                function drawProgress() {
                    window.requestAnimationFrame(drawProgress)
                    canvasPCtxA.clearRect(0, 0, 120, 6)
                    canvasPCtxA.fillStyle = "rgb(230,230,230)"
                    canvasPCtxA.fillRect(pc / i, 0, 120, 6)
                }
                drawProgress()

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

        console.log(bufferLength);
        //转化为数组最大高度128
        var dataArray = new Uint8Array(bufferLength);


        canvasCtx.fillStyle = 'black'; 
        canvasCtx.translate(0,100)
        function draw() {
            //requestAnimationFrame可以在浏览器页面不刷新是重复绘制页面
            //页面完成时可以考虑把宽度写定值,降低性能要求
            //减少canvas API调用
            requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)
            canvasCtx.clearRect(0, 0,200, 100)
            var barHeight, x = 0

            //绘制            
            for (i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] 
                canvasCtx.fillRect(x,0, 6, barHeight);
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