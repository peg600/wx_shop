var Sign = {};

Sign.params = {
  context: null,
  isButtonDown: false,
  arrx: [],
  arry: [],
  arrz: [],
  canvasw: 0,
  canvash: 0,
  upof: {},
  radius: 0,
  has: [],
  lineMax: 10,
  lineMin: 3,
  linePressure: 10,
  smoothness: 40
};

Sign.canvasStart = function (event, canvasID) {
  Sign.params.isButtonDown = true;
  Sign.params.arrz.push(0);
  Sign.params.arrx.push(event.changedTouches[0].x);
  Sign.params.arry.push(event.changedTouches[0].y);
  Sign.params.context = wx.createCanvasContext(canvasID);
  Sign.params.context.clearRect(0, 0, Sign.params.canvasw, Sign.params.canvash);
  Sign.params.context.beginPath()
  Sign.params.context.setStrokeStyle('#000000');
  Sign.params.context.setLineWidth(4);
  Sign.params.context.setLineCap('round');
  Sign.params.context.setLineJoin('round');

  Sign.params.context.setFillStyle("rgba(0,0,0,0.4)");

  Sign.params.has = [];
  Sign.params.upof = {
    x: event.changedTouches[0].x,
    y: event.changedTouches[0].y
  };

  Sign.params.lineMax = 10;
  Sign.params.lineMin = 1;
  Sign.params.linePressure = 10;
  Sign.params.smoothness = 50;
};

Sign.data = {
  src: "",
  rpx: ''
};

Sign.distance = function (a, b) {
  var x = b.x - a.x,
    y = b.y - a.y;
  return Math.sqrt(x * x + y * y);
};

Sign.canvasMove = function (event) {
  if (!Sign.params.isButtonDown)
    return;
  var of = {
    x: event.changedTouches[0].x,
    y: event.changedTouches[0].y
  };
  var up = Sign.params.upof;
  var ur = Sign.params.radius;
  Sign.params.has.unshift({
    time: new Date().getTime(),
    dis: Sign.distance(up, of)
  });
  var dis = 0;
  var time = 0;
  for (var n = 0; n < Sign.params.has.length - 1; n++) {
    dis += Sign.params.has[n].dis;
    time += Sign.params.has[n].time - Sign.params.has[n + 1].time;
    if (dis > Sign.params.smoothness)
      break;
  }
  var or = Math.min(time / dis * Sign.params.linePressure + Sign.params.lineMin, Sign.params.lineMax) / 2;
  Sign.params.radius = or;
  Sign.params.upof = of;
  if (Sign.params.has.length <= 2)
    return;
  var len = Math.round(Sign.params.has[0].dis / 2) + 1;
  for (var i = 0; i < len; i++) {
    var x = up.x + (of.x - up.x) / len * i;
    var y = up.y + (of.y - up.y) / len * i;
    var r = ur + (or - ur) / len * i;
    Sign.params.context.beginPath();
    Sign.params.context.arc(x, y, r, 0, 2 * Math.PI, true);
    Sign.params.context.fill();
  }

  Sign.params.context.draw(true);
};

Sign.canvasEnd = function (event) {
  Sign.params.isButtonDown = false;
};

Sign.cleardraw = function () {
  //清除画布
  Sign.params.arrx = [];
  Sign.params.arry = [];
  Sign.params.arrz = [];
  Sign.params.context.clearRect(0, 0, Sign.params.canvasw, Sign.params.canvash);
  Sign.params.context.draw(false);
};

module.exports = Sign;