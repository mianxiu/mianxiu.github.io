function navHidden(type){
    //移动端进入子栏目后更改导航样式
    if(type === 'on'){
        $('#navigation').style = 'height:100px;position:absolute;overflow:hidden;background-color:red;width:100vw;'
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
        let navW = parseInt(getComputedStyle($('#navigation'),null).marginLeft.replace(/px/,''))
        $('#navigation').addEventListener('touchmove',e=>{
            let x = e.changedTouches[0].pageX
            let mw = parseInt(getComputedStyle($('#navigation > ul'),null).marginLeft.replace(/px/,''))
            r.push(x)

            if(r.slice(-2)[1]-r.slice(-2)[0]>0){
                console.log('向右')
                $('#navigation > ul').style.marginLeft = (510-x) + 'px'
            }else if(r.slice(-2)[1]-r.slice(-2)[0]<0){
                console.log('向左')
                console.log(x)
                $('#navigation > ul').style.marginLeft = -(510-x) + 'px'
                
            }
        })
    }
}
