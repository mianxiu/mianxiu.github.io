const mixxoPost = (function (mod) {

    // 初始化
    var { Query, User } = AV;
    AV.init('N8ILsvPRQiKpIOlRETRw0ShQ-gzGzoHsz', 'hp80QRKBtn8fT48ImaCJxqFE');

    let AdminNick = 'mianxiu'

    /**
     * 登录函数
     * @param {string} nick 
     * @param {string} admin 
     * @param {string} password 
     */
    let logInAdmin = function (nick, admin, password) {
        if (nick === AdminNick) {
            AV.User.logIn(admin, password).then(loggedInuser => {
                console.log('登录成功')
                CurrentUser.init()
            }, error => {
            })
        }
    }



    // 声明一个 Todo 类型
    var Todo = AV.Object.extend('Todo');
    var todo = new Todo();
    /**
     * 创建数据
     * @param {string} usernick
     * @param {string} mail 
     * @param {string} website 
     * @param {string} comments 
     * @param {string} headImgID 
     */
    let createPOST = function (usernick, mail, website, comments, url, headImgID, run, err) {
        todo.set('usernick', usernick);
        todo.set('mail', mail)
        todo.set('website', website);
        todo.set('comments', comments);
        todo.set('url', url);
        todo.set('headimg', headImgID)
        todo.save().then(function (todo) {
            // 成功保存之后，执行其他逻辑.
            run
            // console.log('New object created with objectId: ' + todo.id);
        }, function (error) {
            // 异常处理
            err
            // console.error('Failed to create new object, with error message: ' + error.message);
        });
    }

    var Floor = AV.Object.extend('Floor');
    var floor = new Floor()
    let createFloor = function (usernick, mail, website, comments, parentId, headImgID, re, run, err) {
        floor.set('usernick', usernick);
        floor.set('mail', mail)
        floor.set('website', website);
        floor.set('comments', comments);
        floor.set('parentId', parentId);
        floor.set('url', window.location.pathname);
        floor.set('headimg', headImgID);
        floor.set('re', re);
        floor.save().then(function (floor) {
            // 成功保存之后，执行其他逻辑.
            let hasReply = AV.Object.createWithoutData('Todo', parentId)
            hasReply.set('hasReply', true);
            hasReply.save()
            run
        }, function (error) {
            // 异常处理
            err
            // console.error('Failed to create new object, with error message: ' + error.message);
        });
    }



    /**
     * 管理员面板
     */
    let CurrentUser = {
        getCurrentUser: function () {
            let currentUser = AV.User.current();
            if (currentUser) {
                return true
            }
            else {
                return false
            }
        },

        deleteControl: function () {
            console.log(this.getCurrentUser())
            return this.getCurrentUser() == true ? 'delete' : ''
        },

        /**
         * 管理面板初始化
         */
        init: function () {
            if (this.getCurrentUser() === true) {
                $('#mp-comments-panel').innerHTML += `
                 <div class="mp-admin-panel">
                 <span>🔑 Logout</span>
                 </div>`

                $('#mp-comments-panel').addEventListener('click', event => {
                    console.log('退出登录')
                    AV.User.logOut()
                    $('#mp-comments-panel').removeChild($('.mp-admin-panel'))
                })
            };
        }
    }



    const min = 60000; // 1 min
    const hour = 3600000 // 1 hour
    const today = 86400000 // 1 day
    const yesterday = 172800000 // 2 day
    /**
     * 计算距离当前时间
     * @param {*} dateMs 时间戳 
     */
    let dateAt = function (dateMs) {
        let date = new Date(dateMs)
        let sub = Date.now() - dateMs
        if (sub < min) {
            return parseInt(sub / 1000) + '秒前'
        }
        else if (sub < hour) {
            return parseInt(sub / min) + '分钟前'
        }
        else if (sub < today) {
            return parseInt(sub / hour) + '小时'
        }
        else if (sub < yesterday) {
            return '昨天 ' + date.getHours() + ':' + date.getMinutes()
        } else {
            return date.getFullYear() + '年' + date.getMonth() + 1 + '月' + date.getDay() + '日'
        }
    }

    // 管理标签样式
    let addAdminTag = function (nickTest) {
        if (nickTest === AdminNick) {
            return `<span class="mp-writer">writer</span>`
        } else {
            return ''
        }
    }

    /**
     * 
     * @param {*} createdAt 时间戳,createdAt 或 reply CreatedAt
     * @param {*} mprNick 昵称
     * @param {*} adiminSpan 管理员标签 HTML String
     * @param {*} DataAt 引用DateAt()
     * @param {*} parentId 主楼id
     * @param {*} dataId ObejectId
     * @param {*} re 我所回复的昵称，主楼为''
     * @param {*} comment 回复内容
     * @param {*} at 默认指向留言人，主楼为''
     * @param {*} index 楼内回复层数，主楼为''
     * @param {*} class 表名
     * @param {*} deleteControl 引用CurrentUser deleteControl()
     */
    let mpPostBodyString = function (createdAt, mprNick, adiminSpan, parentId, objId, re, comment, at, className, deleteControl) {

        let ul = at === '' ? `<ul class="mp-reply" id="${parentId}"></ul>` : ''
        return `<li class="mp-post-li"><div class="mp-post-body">
                                    <div class="headimg"></div>
                                    <div>
                                    <div class="mpr-header" data-date="${createdAt}">
                                        <span class="mpr-nick">${mprNick}${adiminSpan}</span>
                                        <span class="mpr-date">${dateAt(createdAt)}<span>
                                    </div>
                                    <div class="mpr-body" ><span>${re} </span>${comment}</div>
                                    <div class="mpr-footer">
                                    <div parent-id="${parentId}" obj-id="${objId}">
                                    <span class="mpr-reply"  at="${at}">reply</span>
                                    <span class="mpr-delete" class-name="${className}">${deleteControl}</span>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                                    ${ul}
                                    </li>`
    }



    // 查询楼内回复

    let getReply = function (parentId) {
        let queryFloor = new AV.Query('Floor')
        queryFloor.contains('parentId', parentId);
        queryFloor.find().then(r => {
            for (let index of r) {
                let i = index.attributes
                document.getElementById(parentId.toString()).innerHTML += `
                ${mpPostBodyString(Date.parse(index.createdAt), i.usernick, addAdminTag(i.usernick), parentId, index.id, i.re, i.comments, i.usernick, index.className, CurrentUser.deleteControl())}
                `
            }
        })
    }


    // 主楼查询 
    var query = new AV.Query('Todo');
    mod.getComments = function (url) {
        query.contains('url', url);
        query.descending('createdAt');
        query.find().then(result => {
            $('#mp-comments-num > span').innerText = result.length
            for (let i of result) {
                console.log(i.className)
                let attr = i.attributes
                // 主留言读取
                let li = `${mpPostBodyString(
                    Date.parse(i.createdAt),
                    attr.usernick,
                    addAdminTag(attr.usernick),
                    i.id,
                    i.id,
                    '',
                    attr.comments,
                    '',
                    i.className,
                    CurrentUser.deleteControl())}`;
                $('#mp-post-lists').innerHTML += li

                // 判断是否有楼内回复
                if (attr.hasReply) {
                    getReply(i.id)
                }
            }



            // reply button 按钮监听
            //
            $('#mp-post-lists').addEventListener('click', event => {
                // 回复
                let parentId = event.target.parentNode.getAttribute('parent-id')
                if (event.target.className === 'mpr-reply') {
                    let at = event.target.getAttribute('at')
                    let re = at !== '' ? '@' + at : ''
                    let mp = $('.mixxo-post')

                    mp.setAttribute('parent-id', parentId)
                    mp.setAttribute('re', re)
                    mp.setAttribute('type', 'reply')
                    mp.classList.add('mixxo-post-reply')
                    $('#mp-overlay').classList.add('mp-overlay')
                    $('.mp-reply-tips').style.display = 'flex'
                    $('.mp-reply-tips').innerHTML = event.target.parentNode.parentNode.parentNode.parentNode.innerHTML

                }

                if (event.target.className === 'mpr-delete') {
                    let className = event.target.getAttribute('class-name')
                    let objId = event.target.parentNode.getAttribute('obj-id')
                    let mpLi = document.getElementById(event.target.parentNode.getAttribute('parent-id')).parentNode
                    let deleteObj = AV.Object.createWithoutData(className, objId);
                    deleteObj.destroy().then(function (success) {
                        // 删除成功
                        console.log('delete')
                        mpLi.remove()
                    }, function (error) {
                        // 删除失败
                    });
                    
                }
            })

            $('#mp-overlay').addEventListener('click', event => {
                $('.mixxo-post').setAttribute('type', 'comment')
                $('.mixxo-post').classList.remove('mixxo-post-reply')
                $('#mp-overlay').classList.remove('mp-overlay')
                $('.mp-reply-tips').style.display = ''
                $('.mp-reply-tips').innerHTML = ''
            })

        }).catch(error => {
            console.log('拉取评论系统失败')
        })
    }


    // 写入DOM、loacalStorage
    let maxCommentLenght = 2000 //字数限制
    let dataPlaceholder = '留言...'
    mod.mpAnimation = function () {
        CurrentUser.init() //
        // 读取、储存信息到local Storage
        let useStroage = function () {
            let g = JSON.parse(localStorage.getItem('mixxoPostCache'))
            if (g != null) {
                $('#mp-nick').value = g.nick
                $('#mp-mail').value = g.mail
                $('#mp-website').value = g.website

                document.querySelectorAll('.mp-info').forEach(target => {
                    if (target.value !== '') {
                        target.parentNode.children[0].classList.add('mp-label-trans')
                        target.classList.add('mp-ui-pt')
                    }
                })
            }
        }
        useStroage()



        // 评论框UI相关
        // user,mail,websit
        $('.mixxo-user-info').addEventListener('input', event => {
            if (event.target.value.length > 0) {
                event.target.parentNode.children[0].classList.add('mp-label-trans')
                event.target.classList.add('mp-ui-pt')
            } else {
                event.target.parentNode.children[0].classList.remove('mp-label-trans')
                event.target.classList.remove('mp-ui-pt')
            }

        })


        // 输入框缩放
        $('#mp-comment').addEventListener('focusin', event => {
            event.target.classList.add('mp-comment-minHeight')
        })
        $('#mp-comment').addEventListener('blur', event => {
            event.target.classList.remove('mp-comment-minHeight')
        })

        // 占位符
        let placeholder = () => {
            $('#mp-comment').setAttribute('data-placeholder', dataPlaceholder)
            $('#mp-comment + label > span').innerText = maxCommentLenght
        }
        placeholder()
        $('#mp-comment').addEventListener('input', event => {
            event.target.parentNode.children[1].children[0].innerText = maxCommentLenght - event.target.innerText.length
            if (event.target.innerText !== '') {
                event.target.setAttribute('data-placeholder', '')
            } else {
                placeholder()
            }

            // 最大字数限制
            if (event.target.innerText.length > maxCommentLenght) {
                let l = event.target.innerText
                let p = l.slice(0, maxCommentLenght)
                let em = l.slice(maxCommentLenght)

            }
        })



        // 发表评论 && 管理员登录
        let currentUrl = window.location.pathname
        $('#mp-post').addEventListener('click', event => {
            let nickValue = $('#mp-nick').value
                , mailValue = $('#mp-mail').value
                , webValue = $('#mp-website').value
                , commentsValue = $('#mp-comment').innerText.replace(/\n|\n\r|\r/g, '<br>')
                , replyArray = []

            let run = function () {
                $('#mp-comment').innerText = ''
                $('#mp-comment + label > span').innerText = maxCommentLenght
                // 写入本地
                localStorage.setItem('mixxoPostCache', '{"nick":"' + nickValue + '","mail":"' + mailValue + '","website":"' + webValue + '"}')
            }

            if (nickValue === '') {
                $('#mp-nick').focus()
            }
            else if (mailValue === '') {
                $('#mp-mail').focus()
            }
            else if (commentsValue === '') {
                $('#mp-comment').focus()
            }
            else if (commentsValue.length > maxCommentLenght) {

            }
            else {
                let toReply = function () {
                    if ($('.mixxo-post').getAttribute('type') === 'comment') {
                        createPOST(nickValue, mailValue, webValue, commentsValue, currentUrl, '2d', replyArray, run())
                    } else {
                        let parentId = $('.mixxo-post').getAttribute('parent-id')
                        let re = $('.mixxo-post').getAttribute('re')

                        let run = function () {
                            console.log(this.id)
                        }
                        createFloor(nickValue, mailValue, webValue, commentsValue, parentId, '2d', re, run())
                    }
                }
                // 管理昵称检测
                if (nickValue === AdminNick) {
                    // 存在凭证
                    if (CurrentUser.getCurrentUser() === true) {
                        toReply()
                    } else {
                        logInAdmin(nickValue, mailValue, webValue)
                    }
                } else {
                    toReply()
                    //其他留言
                    // createPOST(nickValue, mailValue, webValue, commentsValue, currentUrl,'2d',run())

                }
                // 'mianxiu', '123456.mix.blog'

            }
        })
    }


    //
    const $ = function (selector) {
        return document.querySelector(selector);
    }

    return mod
})(window.mixxoPost || {})

