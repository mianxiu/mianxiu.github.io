
const mixxoPost = (function (mod) {
    

    let appId, appKey, adminNick,page, frameWidth,flexDirection,gravatarCDN, md5CDN;
    let defaultPage = 15;
    let defaultFrameWidth = '100%';
    let defaultFlexDirection = 'row'
    let defaultInfoWidth = '33.33%'
    let defaultMD5CDN = '//cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.min.js'
    let defaultGravatarCDN = '//gravatar.loli.net/avatar/'


    /**
     * 
     * @param {*} config {appId, appKey, adminNick,page, frameWidth,flexDirection,gravatarCDN, md5CDN}
     */
    mod.init = function (config) {
            appId = config.appId
            appKey = config.appKey
            adminNick = config.adminNick === undefined ? 'admin' : config.adminNick // 默认占用 admin
            page = config.page === undefined ? defaultPage : config.page // 分页
    
            config.flexDirection === undefined ? flexDirection =  defaultFlexDirection :  (flexDirection = config.flexDirection,defaultInfoWidth = '') // input flex aixs : css 
            frameWidth = config.frameWidth === undefined ? defaultFrameWidth : config.frameWidth
            gravatarCDN = config.gravatarCDN === undefined ? defaultGravatarCDN : config.gravatarCDN // CDN
            md5CDN = config.md5CDN === undefined ? defaultMD5CDN : config.md5CDN // CDN
            addmixxoDOM()  
            mixxopost()
               
    }

let addmixxoDOM = ()=>{
    let css = `<style>#mixxopost .mixxo-post-reply{z-index:2;max-width:80vw;position:fixed;left:0;top:0;margin-top:20vh;border:0;margin-left:calc((100vw - 80vw)/ 2);box-shadow:0 0 15px 0 rgba(0,0,0,.36);transition:width .2s,height .2s}.mp-overlay{z-index:1;background-color:rgba(0,0,0,.7);position:fixed;top:0;left:0;height:100%;width:100%}section.mixxo-post{width:100%;background:#fff;border:1px solid #ededed;transition:box-shadow .3s;overflow:hidden}#mixxopost{margin-bottom:40px;max-width:${frameWidth};width:100%}#mixxopost>section.mixxo-post>.mp-reply-tips{display:none;color:#5a5a5a;padding:.2rem;margin-bottom:0;background-color:#f8f8f8}#mixxopost>section.mixxo-post>.mp-reply-tips .mpr-footer{display:none}#mixxopost>section.mixxo-post>section.mixxo-user-info{display:flex;flex-direction:column;border-bottom:1px dashed #ededed;overflow:hidden}#mixxopost>section.mixxo-post>section.mixxo-user-info>div{height:36px;padding:10px 20px}#mixxopost>section.mixxo-post>section.mixxo-comments #mp-comment{z-index:1;position:relative;padding:20px;background:0 0;border:0;color:#262626;font-size:.14rem;min-height:48px;height:auto;outline:0;resize:none;overflow:auto;word-wrap:break-word;transition:min-height .3s}#mixxopost>section.mixxo-post>section.mixxo-comments #mp-comment::before{cursor:text;color:#e2e2e2;content:attr(data-placeholder);display:block}#mixxopost>section.mixxo-post>section.mixxo-comments label{color:#8c8c8c;margin-top:10px;font-size:.12rem;position:absolute;padding:0 20px}#mixxopost>section.mixxo-post>section.mixxo-comments label span{color:#cbcbcb}#mixxopost>section.mixxo-post>section.mixxo-footer{text-align:right}@media screen and (min-width:800px){#mixxopost .mixxo-post-reply{max-width:60vw;margin-left:calc((100vw - 60vw)/ 2)}}@media screen and (min-width:600px){#mixxopost>section.mixxo-post>section.mixxo-user-info{flex-direction:${flexDirection}}#mixxopost>section.mixxo-post>section.mixxo-user-info>div{width:${defaultInfoWidth}}}.mixxo-user-comments>#mp-post-lists{padding-left:0}.mixxo-user-comments>#mp-post-lists>.mp-post-li{display:flex;flex-direction:column}.mixxo-user-comments #mp-comments-panel{display:flex;align-items:center;margin:.3rem 0;font-weight:700;justify-content:space-between}.mixxo-user-comments #mp-comments-panel #mp-comments-num{font-size:16px;}.mixxo-user-comments #mp-comments-panel #mp-comments-num span{margin-right:.1rem}.mixxo-user-comments #mp-comments-panel .mp-admin-panel{overflow:hidden;border:1px solid #e8e8e8;background-color:#f7f7f7;font-size:.14rem;font-weight:400;height:30px;width:30px;border-radius:1rem;color:#a4a4a4;transition:border .2s,width .2s,color .2s,background-color .2s}.mixxo-user-comments #mp-comments-panel .mp-admin-panel:hover{background-color:#50d396;color:#fff;border:1px solid #32b879;width:86px}.mixxo-user-comments #mp-comments-panel .mp-admin-panel>span{display:block;width:86px;margin-top:.04rem;margin-left:.06rem}.mp-reply{list-style:none;margin-left:.14rem}.mp-delete-confirm,.mp-post-body,.mp-reply-tips{display:flex;flex-direction:row;margin-bottom:.2rem}.mp-delete-confirm .headimg,.mp-post-body .headimg,.mp-reply-tips .headimg{display:block;min-width:40px;min-height:40px;max-width:40px;max-height:40px;background-color:#ee5e5e;border-radius:10rem;margin-right:.2rem;background-size:cover}.mp-delete-confirm div .mpr-header,.mp-post-body div .mpr-header,.mp-reply-tips div .mpr-header{margin-bottom:.05rem}.mp-delete-confirm div .mpr-header .mpr-nick,.mp-post-body div .mpr-header .mpr-nick,.mp-reply-tips div .mpr-header .mpr-nick{font-weight:600}.mp-delete-confirm div .mpr-header .mpr-nick .mp-writer,.mp-post-body div .mpr-header .mpr-nick .mp-writer,.mp-reply-tips div .mpr-header .mpr-nick .mp-writer{padding:0 6px 2px;border-radius:.9rem;font-size:.12rem;margin:0 8px;background-color:#fcab1d;color:#fff}.mp-delete-confirm div .mpr-header .mpr-date,.mp-post-body div .mpr-header .mpr-date,.mp-reply-tips div .mpr-header .mpr-date{padding-left:.1rem;font-weight:lighter;font-size:.14rem;color:#878787}.mp-delete-confirm div .mpr-body,.mp-post-body div .mpr-body,.mp-reply-tips div .mpr-body{font-size:.14rem}.mp-delete-confirm div .mpr-body span,.mp-post-body div .mpr-body span,.mp-reply-tips div .mpr-body span{color:#9c9c9c}.mp-delete-confirm div .mpr-footer,.mp-post-body div .mpr-footer,.mp-reply-tips div .mpr-footer{color:#b7b7b7;font-size:.14rem;font-weight:lighter;margin:.05rem 0}.mp-delete-confirm div .mpr-footer span:hover,.mp-post-body div .mpr-footer span:hover,.mp-reply-tips div .mpr-footer span:hover{color:#19b997}.mp-delete-confirm div .mpr-footer .mpr-delete,.mp-post-body div .mpr-footer .mpr-delete,.mp-reply-tips div .mpr-footer .mpr-delete{display:none;margin-left:.1rem}.mp-delete-confirm div .mpr-footer .mpr-delete:hover,.mp-post-body div .mpr-footer .mpr-delete:hover,.mp-reply-tips div .mpr-footer .mpr-delete:hover{color:#b91919}.mp-delete-confirm{width:50vw;padding:.2rem;position:fixed;top:20vh;display:none;left:0;z-index:2;border-radius:.1rem;background-color:#fff;margin-left:calc((100vw - 50vw)/ 2)}.mp-delete-confirm div{width:100%}.mp-delete-confirm div .mpr-footer>div{text-align:right;font-weight:700;margin-top:.3rem}.mp-delete-confirm div .mpr-footer>div span.mpr-cancel{margin-right:.1rem}.mp-delete-confirm div .mpr-footer>div span.mpr-delete{margin-left:0;background-color:#fa2959;color:#ffffffeb;padding:.06rem .1rem;border-radius:1rem}.mp-delete-confirm div .mpr-footer>div span.mpr-delete:hover{color:#ffffffeb;background-color:#be2549}.mp-comment-minHeight{min-height:64px!important}.mp-label-trans{transform:scale(.8) translateY(-10px)}.mp-ui-pt{padding-top:10px}.mp-label{line-height:36px;color:#999;font-size:.14rem;position:absolute;transform-origin:left;transition:transform .2s;cursor:text}.mp-info{height:36px;outline:0;border:0;width:100%;transition:padding .2s}#mp-post{width:80px;height:36px;background-color:#000;color:#fff;border:0;outline:0}#mp-post:hover{background-color:#32b879;transition:background-color .1s}@keyframes mpSuccesstTip{0%{transform:translateY(0)}50%{transform:translateY(-1rem)}99%{transform:translateY(.6rem)}}.mp-success{display:none}.mp-success-tips{display:flex;animation-duration:1.4s;animation-name:mpSuccesstTip;animation-timing-function:ease-in-out;align-items:center;justify-content:center;color:#fff;z-index:999;border-radius:.5rem;left:calc((100vw - 20vw)/ 2);bottom:-.8rem;position:fixed;height:60px;width:20vw;background-color:#000000be}.mp-next-hidden{display:none}#mp-next-page{text-align:center;border:1px solid #ececec;padding:.08rem;color:#b0b0b0;border-radius:.06rem}#mp-next-page:hover{background-color:#fcfcfc}</style>`
    let layout = `<section class="mixxo-post" type="comment">
    <span class="mp-reply-tips"></span>   
        <section class="mixxo-user-info">
            <div>
                <label class="mp-label" for="mp-nick">昵称</label>
                <input id="mp-nick" class="mp-info" name="name" autocomplete="off" type="text">
            </div>
            <div>
                <label class="mp-label" for="mp-mail">邮箱</label>
                <input id="mp-mail" class="mp-info" name="mail" autocomplete="off" type="text">
            </div>
            <div>
                <label class="mp-label" for="mp-website">网站</label>
                <input id="mp-website" class="mp-info" name="website" autocomplete="off" type="text">
            </div>
        </section>
        <section class="mixxo-comments">
                <div data-placeholder="" contenteditable="true" id="mp-comment"></div>
                <label for="mp-comment"><span></span></label>
        </section>
        <section class="mixxo-footer">
        <button type="button" id="mp-post">回复</button>
        </section>
    </section>
    <div class="mixxo-user-comments">
            <div id="mp-comments-panel"><div id="mp-comments-num"><span></span>Comments</div></div>
            <ul id="mp-post-lists" page="0"></ul>
            <div id="mp-next-page" class="mp-next-hidden">next</div>
    </div>
    <span class="mp-delete-confirm"></span>
    <div id="mp-success-tips" class="mp-success">回复成功</div>
    <div id="mp-overlay"></div>
    `

    document.querySelector('head').insertAdjacentHTML('beforeend',css)
    document.querySelector('#mixxopost').insertAdjacentHTML('afterbegin',layout)
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
            return date.getFullYear() + '年' + ( date.getMonth() + 1 ) + '月' + date.getDay() + '日'
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


    // bind 下一页按钮
    let bindNextPage = function(selector){
        selector.addEventListener('click',event=>{   
            getComments(window.location.pathname) // 获取评论 
        })
    }
    bindNextPage($('#mp-next-page'))

    // 统计总数
    var count = new AV.Query('Todo');
    let getCount = function (url) {
        count.equalTo('url', url);
        count.count().then(c=>{      
            console.log(c)
            $('#mp-comments-num > span').innerText = c
        })
      }
    getCount(window.location.pathname)



   // 查询 主楼
    var query = new AV.Query('Todo');
    const getComments = function (url) {
        let p = $('#mp-post-lists').getAttribute('page')
        query.contains('url', url);
        query.descending('createdAt');
        query.limit(page)
        query.skip(p*page)
        query.find().then(result => {
            $('#mp-post-lists').setAttribute('page',Number(p) + 1)

            //  
            replyButtonCtr()

            // 判断留言总数
            if(result.length >= page){
                $('#mp-next-page').classList.remove('mp-next-hidden')
            }else{
                $('#mp-next-page').classList.add('mp-next-hidden')
            }

            // 主留言读取
            for (let i of result) {
                let attr = i.attributes
                
                let li = `${mpPostBodyString(Date.parse(i.createdAt), attr.usernick, addAdminTag(attr.usernick), i.id, i.id, '', attr.comments, '', i.className, attr.headImgID, CurrentUser.deleteControl())}`;
                $('#mp-post-lists').insertAdjacentHTML('beforeend',li)

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

