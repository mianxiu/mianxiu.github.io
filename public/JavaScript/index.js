

window.onload = function () {
    var a = ['这是什么', '不会是真的吧', '开个玩乐', '无用功', '惨~~','surprise!!!','........']


    getRandomInt = function (min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor((Math.random() * (max - min)) + min)
    }
    document.querySelector('button.k').innerText = a[getRandomInt(1, 5)]
}
