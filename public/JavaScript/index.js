

window.onload = function () {
  mp3Player();
}


function r (){
    var a = ['这是什么', '不会是真的吧', '开个玩乐', '无用功', '惨~~','surprise!!!','........']
        getRandomInt = function (min, max) {
            min = Math.ceil(min)
            max = Math.floor(max)
            return Math.floor((Math.random() * (max - min)) + min)
        }
        document.querySelector('button.k').innerText = a[getRandomInt(1, 5)]
}

function getIndex(childNode){
    //获取索引值
    let p =  childNode.parentNode
    let pChild = p.children
        for(i=0;i<pChild.length;i++){
            if(pChild[i] === childNode){
                  return i
                }
            
            }
        }

function mp3Player(){
    //播放器
    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

    var playList = []
    for (const l of document.querySelector('#playList').children) {
        playList.push('public/music/'+l.innerText+'.mp3') 
    }


    var player = document.querySelector('#player')
    var source =  audioCtx.createMediaElementSource(player);   

  
    var analyser = audioCtx.createAnalyser()
    
    source.connect(analyser);
    analyser.connect(audioCtx.destination)


    //默认音源
    player.src=playList[0]
    player.onended = function(){
            console.log('下一曲')
            let e = playList.indexOf(player.src)
            if(e+1 < playList.length){
                player.src = playList[e+1]
              
            }else{
                return player.src = playList[0]
            }

        
    }
    document.querySelector('#mp3Player').addEventListener('dblclick',function(db){
    //根据双击加载音源 
    player.src = playList[getIndex(db.path[0])]
    
    })
    
}