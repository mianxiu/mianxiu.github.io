//1. mp3播放器--------------------------------------------------------------------------------
function mp3Player() {
  //域名的正则，用于匹配歌曲
  //new RegExp(/.*mianxiu\.github\.io\//)
  var musicRegex = new RegExp(/.*./);
  //根目录
  var URL = window.location.href.split(/\//);
  var domin = URL[0] + "//" + URL[2];
  var musicPath = domin + "/music/";

  let htmlFontSize = parseInt(getComputedStyle($("html"), null).getPropertyValue("font-size").replace("px"));
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  var playList = [];
  var playPath = domin + "/music/";

  for (let l = 0; l < $("#playList>ol").children.length; l++) {
    playList.push(playPath + $("#playList>ol").children[l].innerText + ".mp3");
  }

  // audio API
  var player = $("#player");
  var source = audioCtx.createMediaElementSource(player);
  var analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  //------------------------------------------------------//
  //按钮播放/暂停+动画相关
  function Playcontrol() {
    let canvasPC = $("#playCtr");
    let C = canvasPC.getContext("2d");

    let canvasToline = $("#ToShow");
    let canvasPCS = $("#playCtrShade");

    let gx1 = [0, 0, 22, 22, 22, 22, 31, 41];
    let gx2 = [0, 8, 20, 8, 18, 30, 38, 30];
    let gy1 = [0, 48, 28, 6, 6, 28, 20, 11];
    let gy2 = [15, 50, 44, 11, 6, 40, 36, 0];

    iconMotions(gx1, gy1, gx2, gy2, canvasPC, ["black"], true);
    iconMotions(gx1, gy1, gx2, gy2, canvasPCS, ["rgb(230,230,230)"], true);
    iconMotions(gx1, gy1, gx2, gy2, canvasToline, ["red"], true);

    player.addEventListener("pause", function () {
      iconMotions(gx1, gy1, gx2, gy2, canvasPC, ["black"], true);
      iconMotions(gx1, gy1, gx2, gy2, canvasPCS, ["rgb(230,230,230)"], true);
      iconMotions(gx1, gy1, gx2, gy2, canvasToline, ["red"], false);
    });
    player.addEventListener("play", function () {
      iconMotions(gx1, gy1, gx2, gy2, canvasPC, ["black"], false);
      iconMotions(gx1, gy1, gx2, gy2, canvasPCS, ["rgb(230,230,230)"], false);
      iconMotions(gx1, gy1, gx2, gy2, canvasToline, ["red"], true);
    });

    let p = $("#mp3Player");
    let pCtr = $("#playCtr");

    //暂停/播放
    pCtr.onclick = function (e) {
      if (player.paused == false) {
        //绘制暂停按钮
        player.pause();
      } else if (player.paused == true) {
        player.play();
      }
    };
  }
  Playcontrol();

  //播放列表控制
  let playListOl = $("#playList>ol");
  let pl = $("#playList");

  let olH = playListOl.offsetHeight;
  let olB = window.getComputedStyle($("#playList>ol>li"), null).marginBottom;
  let quarterH = olH / playListAry().length;

  //单击播放
  pl.addEventListener("click", function (e) {
    if (e.target.id !== "playList") {
      player.src = playListAry()[getIndex(e.target)];
    }
  });

  //滚动滚轮浏览歌曲
  function listView() {
    let stopScroll = function (event) {
      //event.preventDefault();
      //
    };
    document.querySelector("#mp3Player").addEventListener("mouseenter", e => {
      document.querySelector("html").addEventListener("wheel", stopScroll, false);

      document.querySelector("#mp3Player").addEventListener("mouseleave", e => {
        document.querySelector("html").removeEventListener("wheel", stopScroll, false);
      });
    });

    //添加序号
    function addPlayListIndex() {
      let p = $("#playList");
      p.setAttribute("num", p.children[0].children.length);
      for (let i = 0; i < p.children[0].children.length; i++) {
        p.children[0].children[i].setAttribute("num", i);
      }
    }
    addPlayListIndex();

    //歌单滚动
    let pl = $("#playList ol");
    let g;
    //li的高度(包括margin)
    let playListLiHeight = $("#playList ol li").offsetHeight;
    $("#playList").addEventListener("wheel", function (e) {
      let olIndex = Number(pl.getAttribute("index"));
      if (e.deltaY < 0 && olIndex !== 0) {
        //up
        pl.style.transform = "translateY(" + -(playListLiHeight * olIndex - playListLiHeight) + "px)";
        pl.setAttribute("index", Number(pl.getAttribute("index")) - 1);
      } else if (
        e.deltaY > 0 &&
        olIndex < Number($All("#playList > ol > li")[$All("#playList > ol > li").length - 1].getAttribute("num"))
      ) {
        //down
        pl.style.transform = "translateY(" + -(playListLiHeight * olIndex + playListLiHeight) + "px)";
        pl.setAttribute("index", olIndex + 1);
      }
    });

    $("#playList").addEventListener("mouseleave", function (e) {
      //通过歌曲名获得歌曲索引，计算marginTop
      let songPath = musicPath + decodeURI($("#player").src.split(/\//)[4]);
      let initial_marginTop = playListAry().indexOf(songPath) * -playListLiHeight;

      pl.setAttribute("index", playListAry().indexOf(songPath));
      // console.log(songPath)
      // console.log(playListAry())
      pl.style.transform = "translateY(" + initial_marginTop + "px)";
    });

    //------------------------------------------------------//
    //循环播放列表
    player.src = playListAry()[0];
    player.onended = function () {
      //歌曲切换效果
      let songPath = playPath + decodeURI($("#player").src.split(/\//)[4]);
      let e = playListAry().indexOf(songPath);
      if (e + 1 < playListAry().length) {
        playListOl.style.transform = "translateY(" + -(e + 1) * playListLiHeight + "px)";
        return (player.src = playListAry()[e + 1]);
      } else {
        playListOl.style.transform = "translateY(0)";
        return (player.src = playListAry()[0]);
      }
    };
  }
  listView();

  /**
   * 动画函数，前4个参数是原图像->变化图形坐标,输出变形动画
   * upend:是否倒放动画
   * @param {array} oX1
   * @param {array} oY1
   * @param {array} toX1
   * @param {array} toY2
   * @param {boolean} upend
   */
  function iconMotions(oX1, oY1, toX1, toY2, C, fillStyle, upend) {
    let Ctx = C.getContext("2d");
    let reqA;
    let x1 = [],
      x2 = [],
      y1 = [],
      y2 = [];

    //坐标参数
    //x1,y1 播放icon，x2
    //不复制数组的话会改变参数，导致无法新参数无效,无法变形
    if (upend == false) {
      x1 = oX1.slice();
      x2 = toX1.slice();
      y1 = oY1.slice();
      y2 = toY2.slice();
      drawMotion();
    } else if (upend == true) {
      x1 = toX1.slice();
      x2 = oX1.slice();
      y1 = toY2.slice();
      y2 = oY1.slice();
      drawMotion();
    }

    function drawMotion() {
      let x = [],
        y = [];
      reqA = requestAnimationFrame(drawMotion);

      for (p = 0; p < x1.length; p++) {
        x.push(x1[p] - x2[p]);
        y.push(y1[p] - y2[p]);
      }
      //x

      for (m = 0; m < x.length; m++) {
        if (x[m] > 0 && x1[m] >= x2[m]) {
          x1[m] -= 1;
        } else if (x[m] < 0 && x1[m] <= x2[m]) {
          x1[m] += 1;
        } else {
        }
      }

      //y
      for (m = 0; m < y.length; m++) {
        if (y[m] > 0 && y1[m] >= y2[m]) {
          y1[m] -= 1;
        } else if (y[m] < 0 && y1[m] <= y2[m]) {
          y1[m] += 1;
        } else {
        }
      }

      //取消监听,也许能释放cpu占用
      if (AryInclue(x1, x2) && AryInclue(y1, y2)) {
        cancelAnimationFrame(reqA);
      }
      //引用drawIcon函数绘制
      drawIcon(x1, y1, fillStyle, C, 2);
    }
  }

  /**绘制4点不规则图形函数 |
   * x1,y2 : 是图形坐标，和drawNum关联.例绘制3个图形，x1,y2分别需要坐标12个 |
   * C : dom节点 |
   * drawNum : 图形数量
   * @param {array} X1
   * @param {array} Y2
   * @param {array} fillStyle
   * @param {Object} Ctx
   * @param {numble} drawNum
   */
  function drawIcon(iX1, iY2, fillStyle, C, drawNum) {
    Ctx = C.getContext("2d");
    Ctx.clearRect(0, 0, C.width, C.height);
    for (n = 1; n <= drawNum; n++) {
      for (i = 0; i < 1; i++) {
        let a = 0 + (n - 1) * 4;
        let b = 1 + (n - 1) * 4;
        let c = 2 + (n - 1) * 4;
        let d = 3 + (n - 1) * 4;
        Ctx.beginPath();
        //绘制原点
        Ctx.moveTo(iX1[a], iY2[a]);
        Ctx.lineTo(iX1[b], iY2[b]);
        Ctx.lineTo(iX1[c], iY2[c]);
        Ctx.lineTo(iX1[d], iY2[d]);
        Ctx.closePath();
        if ((fillStyle.length = 1)) {
          Ctx.fillStyle = fillStyle;
        } else {
          Ctx.fillStyle = fillStyle[n - 1];
        }
        Ctx.fill();
      }
    }
  }

  //进度条,根据#progress的width自动变更
  //时间
  //toFixed()保留小数
  function AudioProgress() {
    player.onloadedmetadata = function () {
      //减少层
      player.addEventListener("timeupdate", function () {
        //动态检测进度条长度
        let Pwidth = parseInt(getComputedStyle($("#progress"), null).width.replace(/px/, ""));
        let pd = player.duration;
        let i = pd / Pwidth;
        let pc = player.currentTime;
        //绘制进度条
        $("#audioProgressA").style =
          "margin-left:" + pc / i / htmlFontSize + "rem;width:" + (Pwidth - pc / i) / htmlFontSize + "rem";

        //歌曲播放时间

        ((pd - pc) / 60).toFixed(2).replace(/\./, ":") === "NaN"
          ? ($("#timePass").innerText = "loading")
          : ($("#timePass").innerText = ((pd - pc) / 60).toFixed(2).replace(/\./, ":"));
      });
    };
  }
  AudioProgress();

  //------------------------------------------------------//
  //可视化频谱
  function visual() {
    let canvas = $("#visual");
    let canvasCtx = canvas.getContext("2d");
    //canvas画布大小
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    analyser.minDecibels = -90;
    analyser.maxDecibles = -10;

    //时域数据？
    //analyser读取的数据都是连续的
    //频谱FFT的大小，越大分析能力越强
    analyser.fftSize = 32;
    //获取1/2长度
    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.fillStyle = "black";

    function draw() {
      analyser.getByteFrequencyData(dataArray);
      //requestAnimationFrame可以在浏览器页面不刷新是重复绘制页面
      //页面完成时可以考虑把宽度写定值,降低性能要求
      //减少canvas API调用
      requestAnimationFrame(draw);
      canvasCtx.clearRect(0, 0, 200, 100);
      var barHeight,
        x = 0;

      //绘制
      for (i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillRect(x, Math.floor(100 - barHeight / 4), 8, 100);
        x += 10;
      }
    }
    draw();
  }

  visual();

  //画红色箭头
  let lt = $("#lineTo");
  ltCtx = lt.getContext("2d");

  ltCtx.lineWidth = 2;
  ltCtx.strokeStyle = "red";

  ltCtx.beginPath();
  ltCtx.moveTo(35, 88);
  ltCtx.bezierCurveTo(35, 88, 39, 42, 9, 5);
  ltCtx.stroke();

  ltCtx.beginPath();
  ltCtx.moveTo(5, 10);
  ltCtx.bezierCurveTo(9, 3, 9, 3, 9, 3);
  ltCtx.bezierCurveTo(9, 3, 21, 7, 25, 6);
  ltCtx.stroke();
}
