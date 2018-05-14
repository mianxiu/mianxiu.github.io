const mixxoPost = (function (mod) {

    // 存储服务
    var { Query, User } = AV;
    AV.init('N8ILsvPRQiKpIOlRETRw0ShQ-gzGzoHsz', 'hp80QRKBtn8fT48ImaCJxqFE');


    var query = new AV.Query('Todo');

    
    let getComments = function (url) {
        // 成功获得实例
        query.contains('url', url);
        query.find().then(result => {
            console.log(result)
        }).catch(error => {
            console.log('拉取评论系统失败')
        })
    }

    //getComments('/essay/2018/01/32/counter/')


    // 声明一个 Todo 类型
    var Todo = AV.Object.extend('Todo');
    /**
     * 写入数据
     * @param {string} username 
     * @param {string} email 
     * @param {string} website 
     * @param {string} comments 
     * @param {string} headImgID 
     */
    let createPOST = function (username, email, website, comments, headImgID, url, run, err) {
        var todo = new Todo();
        todo.set('username', username);
        todo.set('email', email)
        todo.set('website', website);
        todo.set('comments', comments);
        todo.set('url', url);
        todo.set('headimg', headImgID)
        todo.save().then(function (todo) {
            // 成功保存之后，执行其他逻辑.
            run
            console.log('New object created with objectId: ' + todo.id);
        }, function (error) {
            // 异常处理
            err
            console.error('Failed to create new object, with error message: ' + error.message);
        });
    }

    //

    mod.mpAnimation = function () {
        console.log('begin listen')
        let currentUrl = window.location.pathname
        document.querySelector('.mixxo-user-info').addEventListener('input', event => {
            if (event.target.value.length > 0) {
                event.target.parentNode.children[0].classList.add('mp-label-trans')
                event.target.classList.add('mp-ui-pt')
            } else {
                event.target.parentNode.children[0].classList.remove('mp-label-trans')
                event.target.classList.remove('mp-ui-pt')
            }

        })

        // focus 改变样式
        document.querySelector('#mp-comment').addEventListener('focusin',event=>{
            event.target.style.minHeight = '36px'
        })
        document.querySelector('#mp-comment').addEventListener('blur',event=>{        
            event.target.style = ''  
        })
        document.querySelector('#mp-comment').addEventListener('input',event=>{
            console.log(event.target.innerText.length)
            if (event.target.innerText !== ''){
                event.target.parentNode.children[1].style.display ='none'
            }else{
                event.target.parentNode.children[1].style.display =''
            }
        })

        document.querySelector('#mp-post').addEventListener('click', event => {
            let nameValue = document.querySelector('#mp-name').value
                , emailValue = document.querySelector('#mp-email').value
                , webValue = document.querySelector('#mp-website').value
                , commentsValue = document.querySelector('#mp-comment').innerText


            let run = function () {
                console.log('run')
                document.querySelector('#mp-comment').innerText = ''
            }
            if (nameValue !== '' && commentsValue !== '') {
                createPOST(nameValue, emailValue, webValue, commentsValue, '2d', currentUrl, run())

            }
            console.log(nameValue + '|' + emailValue + '|' + webValue + '|' + commentsValue + '|' + currentUrl)

        })
    }
    return mod
})(window.mixxoPost || {})

