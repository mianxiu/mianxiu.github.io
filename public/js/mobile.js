function navHidden(type){
    //移动端进入子栏目后更改导航样式
    if(type === 'on'){
        $('#navigation').style = 'height:100px;width:100vw;'
        $('#navigation > ul').style = 'display:flex;flex-direction:row;position:absolute'    
    }
}
