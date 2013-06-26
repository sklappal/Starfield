function App() {
  
  var that = this;
  
  var pointCount = 400;
  var staticPointCount = 200;
  var velocity = 1;
  
  var WIDTH = GetCanvas().width;
  var HEIGHT = GetCanvas().height;
  var DEFAULT_Z = 200;
  
  var curDrawTime = new Date().getTime();
  var prevDrawTime = 0;
  
  var colorLUT = [];
  
  function GetFrameTime() {
    return curDrawTime - prevDrawTime;
  }
  
  function CreatePoint() {
    return {pos: [100 * (Math.random() - 0.5), 100 * (Math.random() - 0.5), DEFAULT_Z], size: (Math.random() * 200) + 50};
  }
  
  function CreateStaticPoint() {
    return {onScreen: [WIDTH * Math.random(), HEIGHT * Math.random()], size: 2 * Math.random(), color: colorLUT[Math.floor(172*Math.random())]};
  }
  
  function Init() {
    InitColorLUT()
    InitPoints();
  }
  
  function InitColorLUT() {
    for (var i = 0; i < 256; i++) {
      colorLUT.push("rgb(" + i + ", " + i + ", " + i + ")");
    }
  }
  
  function InitPoints() {
    that.points = [];
    for (var i = 0; i < pointCount; i++) {
      that.points.push(CreatePoint());
      that.points[i].pos[2] *= Math.random(); // Start with random Z
    }
    
    that.points.sort(function(p1, p2) { return p1.pos[2] - p2.pos[2]; });
    
    that.staticPoints = [];
    
    for (var i = 0; i < staticPointCount; i++) {
      that.staticPoints.push(CreateStaticPoint());
    }
  }
  
  function StillVisible(point) {
    var onScreen = WorldToScreen(point);
    return point[2] > 0 && onScreen[0] >= 0 && onScreen[1] >= 0 && onScreen[0] < WIDTH && onScreen[1] < HEIGHT;
  }
  
  function len(point) {
    return Math.sqrt(point[0]*point[0] + point[1]*point[1] + point[2]*point[2]);
  }
  
  function MapToMovingPoint(staticPoint) {
    var pos = [];
    pos[0] = ((staticPoint.onScreen[0] / WIDTH) - 0.5) * DEFAULT_Z;
    pos[1] = ((staticPoint.onScreen[1] / HEIGHT) - 0.5) * DEFAULT_Z;
    pos[2] = DEFAULT_Z;
    return { pos: pos, size: staticPoint.size * len(pos), color: staticPoint.color};
  }
  
  function WorldToScreen(ob) {
    var ret = [];
   
    if (ob[2] < 1e-6) {
      ret[0] = ret[1] = 0.0;
      return ret;
    }
   
    ret[0] = (((ob[0] / ob[2])) + 0.5) * WIDTH;
    ret[1] = (((ob[1] / ob[2])) + 0.5) * HEIGHT;
    return ret;   
  }
  
  
  function Draw() {
    var ctx = GetContext();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);    

    for (var i = 0; i < that.staticPoints.length; i++) {
      var pnt = that.staticPoints[i];
      FilledCircle(pnt.onScreen[0], pnt.onScreen[1], pnt.size, pnt.color);
    }
    
    for (var i = that.points.length-1; i >= 0; i--) { // Draw from back to front
      var pnt = that.points[i];
      var pos = pnt.pos;
      var onScreen = WorldToScreen(pos);
      var scaler = 1.0 / len(pos);
      var rgb = Math.min(255, Math.floor(255.0*scaler*25));
      var size = pnt.size * scaler;
      if (rgb > 1 && size >= 0.5) {
        
        var color = pnt.color;
        if (color == undefined) {
          color = colorLUT[rgb];
        } 
        
        FilledCircle(onScreen[0], onScreen[1], size, color);
      }
    }
  }
  
  function DrawOverlay() {
    var ctx = GetContext();
    ctx.fillStyle = "white";
    var text = "Velocity: " + velocity.toFixed(1);
    ctx.fillText(text, WIDTH - 100, HEIGHT - 80);
    var text = "'+' and '-' to adjust"
    ctx.fillText(text, WIDTH - 100, HEIGHT - 60);
    var text = "FPS: " + CalculateFPS().toFixed(1);
    ctx.fillText(text, WIDTH - 100, HEIGHT - 40);
  }
  
  
  var CalculateFPS = function() {
    var fpsFilter = 0.01;
    var frameTime = 1.0/60.0 * 1000;
    
    return function() {
      var elapsed = GetFrameTime();
      frameTime = (1-fpsFilter) * frameTime + fpsFilter * elapsed;
      return 1.0 / frameTime * 1000.0;
    }
  }();
  
  var prevPhysTime = 0;
  var curPhysTime = new Date().getTime();
  
  function TickPhysics() {
    prevPhysTime = curPhysTime;
    curPhysTime = new Date().getTime();
    Animate(curPhysTime-prevPhysTime);
    setTimeout(TickPhysics, 1000/60);
  }
   
  function Animate(elapsed) {
    
    var newPoints = [];
    
    var movement = velocity*elapsed*0.1;
    for (var i = 0; i < that.points.length; i++) {
      that.points[i].pos[2] -= movement;
      
      if (StillVisible(that.points[i].pos)) {
        newPoints.push(that.points[i]);
      }
    }
    
    if (Math.random() < 0.1) {
      newPoints.push(MapToMovingPoint(that.staticPoints[0]));
      that.staticPoints.shift(); // Remove first
      that.staticPoints.push(CreateStaticPoint());
    }
    
    while (newPoints.length < pointCount) {
      newPoints.push(CreatePoint());
    }
    that.points = newPoints;
    
  }
  
  function FilledCircle(posx, posy, radius, color) {
    var ctx = that.context;
    ctx.beginPath();
    var counterClockwise = false;
    ctx.arc(posx, posy, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  
  var bgColor = "#000000";
  
  function GetContext() {
    return GetCanvas().getContext("2d");
  }
  
  function GetCanvas() {
    return document.getElementById("canvas");
  }
  
  function tick() {
    requestAnimFrame(tick);
    prevDrawTime = curDrawTime;
    curDrawTime = new Date().getTime();
    Draw();
    DrawOverlay();
  }
  
  this.Start = function() {
    GetCanvas().style.backgroundColor = bgColor;
    document.body.style.backgroundColor = "#0000FF";
    document.onkeydown = OnKeyDown;
    window.onresize = OnResize;
    OnResize();
    Init();
    that.context = GetContext();
    tick();
    TickPhysics();
  }
  
  function OnResize() {    
    var canvas = GetCanvas();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
  }
  
  function OnKeyDown(event) {
    if (event.keyCode == 109) {
      // -
      if (velocity > 0.0) {
        velocity -= 0.1;
      }
      velocity = Math.max(0.0, velocity);
    }
    
    if (event.keyCode == 107) {
      // + 
      velocity += 0.1;
    }
  }
  
  return this;
}