function navHidden(type){
    //移动端进入子栏目后更改导航样式
    if(type === 'on'){
        $('#navigation').style = 'height:100px;position:absolute;overflow:hidden;background-color:red;width:100vw;'
        $('#navigation > ul').style = 'display:flex;flex-direction:row;position:absolute;'
        $('#essayText').style = 'z-index:4;'
    }else if(type === 'off'){
        $('#navigation').style = ''
        $('#navigation > ul').style = ''
        $('#essayText').style = ''
    }
}
