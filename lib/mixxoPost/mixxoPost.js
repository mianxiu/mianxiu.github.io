
const mixxoPost = (function (mod) {
    

    let appId, appKey, adminNick, gravatarCDN, md5CDN;
    let defaultMD5CDN = '//cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.min.js'
    let defaultGravatarCDN = '//gravatar.loli.net/avatar/'

    /**
     * 
     * @param {*} config {appId:,appKdy:,adminNick:,gravatarCdn:,md5Cdn:}
     */
    mod.init = function (config) {

            appId = config.appId,
            appKey = config.appKey,
            adminNick = config.adminNick === '' ? 'admin' : config.adminNick, // 默认占用 admin
            gravatarCDN = config.gravatarCDN === '' ? defaultGravatarCDN : config.gravatarCDN,
            md5CDN = config.md5CDN === '' ? defaultMD5CDN : config.md5CDN

            mixxopost()
    }

    
let mixxopost = ()=>{
    // 初始化

    if(!AV.applicationId){
        var { Query, User } = AV;
        AV.init(appId,appKey);
    }

    /**
     * selector
     * @param {*} selector 
     */
    const $ = function (selector) {
        return document.querySelector(selector);
    }


    /**
     * change el inline style
     * @param {*} selector 
     * @param {*} style 
     */
    const elementStyle = (selector, style) => {
        Array.prototype.map.call(selector, el => {
            return el.style = style
        })
    }
    /**
     * delete button display in Admin mode
     */
    const deleteButtonDisplay = (on) => {
        const mprDeleteAll = document.querySelectorAll('.mpr-delete')
        if (on) {
            elementStyle(mprDeleteAll, 'display:inline-block')
        } else {
            elementStyle(mprDeleteAll, '')
        }
    }

    /**
     * 登录函数
     * @param {string} nick 
     * @param {string} admin 
     * @param {string} password 
     */
    let logInAdmin = function (nick, admin, password) {
        if (nick === adminNick) {
            AV.User.logIn(admin, password).then(loggedInuser => {
                localStorage.removeItem('mixxoPostCache')
                CurrentUser.init()
                console.log('登录成功')
                $('#mp-mail').value = ''
                $('#mp-website').value = ''
            }, error => {
            })
        }
    }

    // 主评论写入
    var Todo = AV.Object.extend('Todo');
    /**
     * 创建数据
     * @param {string} usernick
     * @param {string} mail 
     * @param {string} website 
     * @param {string} comments 
     * @param {string} headImgID 
     */
    let createPOST = function (usernick, mail, website, comments, url, headImgID, run, err) {
        var todo = new Todo();
        todo.set('usernick', usernick);
        todo.set('mail', mail)
        todo.set('website', website);
        todo.set('comments', comments);
        todo.set('url', url);
        todo.set('headImgID', headImgID)
        todo.save().then(function (index) {
            // 成功保存之后，执行其他逻辑.
            run

            // 伪刷新
            let i = index.attributes
            $('#mp-post-lists').insertAdjacentHTML('afterbegin', mpPostBodyString(Date.parse(index.createdAt), i.usernick, addAdminTag(i.usernick), index.id, index.id, '', i.comments, i.usernick, index.className, i.headImgID, CurrentUser.deleteControl()));
        }, function (error) {
            // 异常处理
            err
        });
    }

    // 回复写入
    var Floor = AV.Object.extend('Floor');
    let createFloor = function (usernick, mail, website, comments, parentId, headImgID, re, run, err) {
        var floor = new Floor()
        floor.set('usernick', usernick);
        floor.set('mail', mail)
        floor.set('website', website);
        floor.set('comments', comments);
        floor.set('parentId', parentId);
        floor.set('url', window.location.pathname);
        floor.set('headImgID', headImgID);
        floor.set('re', re);
        floor.save().then(function (index) {
            // 成功保存之后，执行其他逻辑.
            let hasReply = AV.Object.createWithoutData('Todo', parentId)
            hasReply.set('hasReply', true);
            hasReply.save()
            run

            let i = index.attributes
            document.getElementById(i.parentId).insertAdjacentHTML('beforeend', mpPostBodyString(Date.parse(index.createdAt), i.usernick, addAdminTag(i.usernick), i.parentId, index.id, i.re, i.comments, i.usernick, index.className, i.headImgID, CurrentUser.deleteControl()));

        }, function (error) {
            // 异常处理
            err
        });
    }



    /**
     * 管理员面板
     */
    const CurrentUser = {
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
                    deleteButtonDisplay(false)
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
    const dateAt = function (dateMs) {
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

    // 管理标签样式添加
    const addAdminTag = function (nickTest) {
        if (nickTest === adminNick) {
            return `<span class="mp-writer">writer</span>`
        } else {
            return ''
        }
    }

    /**
     * 返回留言的LI HTML String
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
    let mpPostBodyString = function (createdAt, mprNick, adiminSpan, parentId, objId, re, comment, at, className, headImgID, deleteControl) {

        let ul = `<ul class="mp-reply" id="${parentId}"></ul>`
        return `<li class="mp-post-li"><div class="mp-post-body">
                                    <div class="headimg" style="background-image:url(\'${gravatarCDN + headImgID}\')"></div>
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



    /**
     * 查询楼内回复
     * @param {*} parentId 
     */
    const getReply = function (parentId) {
        let queryFloor = new AV.Query('Floor')
        queryFloor.contains('parentId', parentId);
        queryFloor.find().then(r => {

            for (let index of r) {
                let i = index.attributes
                document.getElementById(parentId.toString()).innerHTML += `
                ${mpPostBodyString(Date.parse(index.createdAt), i.usernick, addAdminTag(i.usernick), parentId, index.id, i.re, i.comments, i.usernick, index.className, i.headImgID, CurrentUser.deleteControl())}
                `
            }

            deleteButtonDisplay(true)
        })
    }

    /**
     * reply button 按钮监听
     */
    const replyButtonCtr = function () {
        //
        $('#mp-post-lists').addEventListener('click', event => {
            // 回复
            // 1 留言
            let parentId = event.target.parentNode.getAttribute('parent-id')
            let mp = $('.mixxo-post')
            if (event.target.className === 'mpr-reply') {
                let at = event.target.getAttribute('at')
                let re = at !== '' ? '@' + at : ''

                mp.setAttribute('parent-id', parentId)
                mp.setAttribute('re', re)
                mp.setAttribute('type', 'reply')
                mp.classList.add('mixxo-post-reply')
                $('#mp-overlay').classList.add('mp-overlay')
                $('.mp-reply-tips').style.display = 'flex'
                $('.mp-reply-tips').innerHTML = event.target.parentNode.parentNode.parentNode.parentNode.innerHTML

            }

            // 2 删除操作
            if (event.target.className === 'mpr-delete') {
                mp.classList.add('mixxo-post-delete')
                $('.mp-delete-confirm').insertAdjacentHTML('beforeend', event.target.parentNode.parentNode.parentNode.parentNode.innerHTML.replace(/mpr\-reply/g, 'mpr-cancel').replace(/reply/g, 'cancel'))
                $('.mp-delete-confirm').style.display = 'flex'
                $('#mp-overlay').classList.add('mp-overlay')


                $('.mp-delete-confirm').addEventListener('click', event => {
                    let c = event.target.className
                    if (c === 'mpr-delete') {

                        let className = event.target.getAttribute('class-name')
                        let objId = event.target.parentNode.getAttribute('obj-id')
                        let mpLi = document.getElementById(event.target.parentNode.getAttribute('parent-id')).parentNode
                        let deleteObj = AV.Object.createWithoutData(className, objId);

                        deleteObj.destroy().then(function (success) {
                            // 删除成功
                            console.log('delete')

                            $('.mp-overlay').click()
                            mpLi.remove()
                        }, function (error) {
                            // 删除失败
                        });
                    } else if (c === 'mpr-cancel') {
                        $('.mp-overlay').click()
                    }
                })

            }

        })


        // overlay 样式
        $('#mp-overlay').addEventListener('click', event => {
            $('.mixxo-post').setAttribute('type', 'comment')
            $('.mixxo-post').classList.remove('mixxo-post-reply')
            $('#mp-overlay').classList.remove('mp-overlay')
            $('.mp-delete-confirm').style.display = ''
            $('.mp-delete-confirm').innerHTML = ''
            $('.mp-reply-tips').style.display = ''
            $('.mp-reply-tips').innerHTML = ''
        })
    }


    // 主楼查询 
    var query = new AV.Query('Todo');
    const getComments = function (url) {
        query.contains('url', url);
        query.descending('createdAt');
        query.find().then(result => {
            $('#mp-comments-num > span').innerText = result.length

            replyButtonCtr()

            for (let i of result) {
                let attr = i.attributes
                // 主留言读取
                let li = `${mpPostBodyString(Date.parse(i.createdAt), attr.usernick, addAdminTag(attr.usernick), i.id, i.id, '', attr.comments, '', i.className, attr.headImgID, CurrentUser.deleteControl())}`;
                $('#mp-post-lists').innerHTML += li

                // 判断是否有楼内回复
                if (attr.hasReply) {
                    getReply(i.id)
                }
            }
            deleteButtonDisplay(true)
        }).catch(error => {
            console.log('拉取评论失败')
        })
    }



    // 写入DOM、loacalStorage
    const mpLabelTrans = () => {
        let mpInfo = document.querySelectorAll('.mp-info')
        Array.prototype.map.call(mpInfo, el => {
            let target = el.target
            if (el.value !== '') {
                el.parentNode.children[0].classList.add('mp-label-trans')
                el.classList.add('mp-ui-pt')
            }
        })
    }

    let maxCommentLength = 2000 //字数限制
    let dataPlaceholder = '留言...'
    let mpDOM = function () {
        CurrentUser.init() // admin 账户初始化
        getComments(window.location.pathname) // 获取评论
        // 读取、储存信息到local Storage
        function useStroage() {
            let g = JSON.parse(localStorage.getItem('mixxoPostCache'))
            if (g != null) {
                $('#mp-nick').value = g.nick
                $('#mp-mail').value = g.mail
                $('#mp-website').value = g.website
                mpLabelTrans()
            }

        }
        useStroage()



        // 评论框UI相关
        // user,mail,websit
        function mixxoUserInfoClass(type, selectorId) {
            let target = document.getElementById(selectorId)
            if (type = true) {
                target.parentNode.children[0].classList.add('mp-label-trans')
                target.classList.add('mp-ui-pt')
            } else {
                target.parentNode.children[0].classList.remove('mp-label-trans')
                target.classList.remove('mp-ui-pt')
            }
        }

        $('.mixxo-user-info').addEventListener('input', event => {
            let target = event.target
            target.value > 0 ? mixxoUserInfoClass(true, target.id) : mixxoUserInfoClass(false, target.id)
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
            $('#mp-comment + label > span').innerText = maxCommentLength
        }
        placeholder()
        $('#mp-comment').addEventListener('input', event => {
            event.target.parentNode.children[1].children[0].innerText = maxCommentLength - event.target.innerText.length
            if (event.target.innerText !== '') {
                event.target.setAttribute('data-placeholder', '')
            } else {
                placeholder()
            }

            // 最大字数限制
            if (event.target.innerText.length > maxCommentLength) {
                let l = event.target.innerText
                let p = l.slice(0, maxCommentLength)
                let em = l.slice(maxCommentLength)

            }
        })


        // 回复提示动画
        let successTipsAnimation = (event) => {
            $('#mp-success-tips').classList.remove('mp-success-tips')
        }
        $('#mp-success-tips').addEventListener('animationend', successTipsAnimation, false)



        // 发表评论 && 管理员登录
        let currentUrl = window.location.pathname
        $('#mp-post').addEventListener('click', event => {
            let nickValue = $('#mp-nick').value
                , mailValue = $('#mp-mail').value
                , webValue = $('#mp-website').value
                , commentsValue = $('#mp-comment').innerText.replace(/\n|\n\r|\r/g, '<br>')
                , replyArray = []

            // 评论后执行
            let postType = function () {
                let mixxoPost = $('.mixxo-post')
                let mpComment = $('#mp-comment')
                let successTips = $('#mp-success-tips')
                let replyTips = $('.mp-reply-tips')
                let textLength = $('#mp-comment + label > span')

                // 判断提交是留言或回复
                if (mixxoPost.getAttribute('type') === 'reply') {
                    mixxoPost.setAttribute('type', 'comment')
                    mixxoPost.classList.remove('mixxo-post-reply')

                    $('#mp-overlay').classList.remove('mp-overlay')
                    replyTips.style.display = ''
                    replyTips.innerHTML = ''
                }
                // 清空输入
                mpComment.innerText = ''
                textLength.innerText = maxCommentLength
                // 提示动画
                successTips.classList.add('mp-success-tips')
                // 写入本地
                localStorage.setItem('mixxoPostCache', '{"nick":"' + nickValue + '","mail":"' + mailValue + '","website":"' + webValue + '"}')
            }




            // post 回复
            function toReply() {
                switch ($('.mixxo-post').getAttribute('type')) {
                    case 'reply':
                        let parentId = $('.mixxo-post').getAttribute('parent-id')
                        let re = $('.mixxo-post').getAttribute('re')
                        createFloor(nickValue, mailValue, webValue, commentsValue, parentId, md5(mailValue), re, postType())
                        break;
                    case 'comment':
                        // comment
                        createPOST(nickValue, mailValue, webValue, commentsValue, currentUrl, md5(mailValue), replyArray, postType())
                        break;
                }
            }

            switch (true) {
                case nickValue === '':
                    $('#mp-nick').focus()
                    break;
                case mailValue === '':
                    $('#mp-mail').focus()
                    break;
                case commentsValue === '':
                    $('#mp-comment').focus()
                    break;
                default:
                    // 管理昵称检测
                    if (nickValue === adminNick) {
                        // 存在凭证
                        if (CurrentUser.getCurrentUser() === true) {
                            toReply()
                        } else {
                            logInAdmin(nickValue, mailValue, webValue)
                            deleteButtonDisplay(true)
                        }
                    } else {
                        //其他用户留言
                        toReply()
                    }
                    break;
            }
        })
    }
    mpDOM()
}
    return mod
})(window.mixxoPost || {})

