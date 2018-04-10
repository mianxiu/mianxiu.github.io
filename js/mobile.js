
function navHidden(type){
    //移动端进入子栏目后更改导航样式
    if(type === 'on'){
        $('#navigation').style = 'height:100px;position:absolute;overflow:hidden;width:100vw;'
        $('#navigation > ul').style = 'display:flex;flex-direction:row;position:absolute;'
        $('#essayText').style = 'z-index:4;'
        navTouchMove()
    }else if(type === 'off'){
        $('#navigation').style = ''
        $('#navigation > ul').style = ''
        $('#essayText').style = ''
    }

   
    //touch move
    function navTouchMove(){
        let r = []
        //准确获取屏幕宽度
        let w = document.documentElement.clientWidth
        let divW = $('#navigation > ul').offsetWidth
        
        let m = function(e){
            e.preventDefault()
        }
        $('#navigation').addEventListener('touchmove',e=>{
            $('html').addEventListener('touchmove',m,false)

            let x = e.changedTouches[0].pageX
            let mw = parseInt(getComputedStyle($('#navigation > ul'),null).marginLeft.replace(/px/,''))
            r.push(x)
            
            if(w < divW){
                if(r.slice(-2)[1]-r.slice(-2)[0]>0){
                    //向右
                    if(mw != 0){
                    $('#navigation > ul').style.marginLeft = (mw+6) + 'px'                    
                    }
                }else if(r.slice(-2)[1]-r.slice(-2)[0]<0){
                    //向左
                    if(mw != -96){
                    $('#navigation > ul').style.marginLeft = (mw-6) + 'px'                    
                    }               
                }
            }
        })

        $('#navigation').addEventListener('touchend',e=>{
            $('html').removeEventListener('touchmove',m,false)
        })
    }
}
