function App() {
  
  var that = this;
  
  var pointCount = 800;
  var velocity = 1;
  
  var WIDTH = GetCanvas().width;
  var HEIGHT = GetCanvas().height;
  
  var curTime = new Date().getTime();
  var prevTime = 0;
  
  var colorLUT = [];
  
  function GetFrameTime() {
    return curTime - prevTime;
  }
  
  function CreatePoint() {
    return {pos: [100 * (Math.random() - 0.5), 100 * (Math.random() - 0.5), 200], size: Math.random() * 200};
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
    
    that.points.sort(function(p1, p2) { return p1.pos[2] - p2.pos[2]; })
    
  }
  
  function StillVisible(point) {
    var onScreen = WorldToScreen(point);
    return point[2] > 0 && onScreen[0] >= 0 && onScreen[1] >= 0 && onScreen[0] < WIDTH && onScreen[1] < HEIGHT;
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

    for (var i = that.points.length-1; i >= 0; i--) { // Draw from back to front
      var onScreen = WorldToScreen(that.points[i].pos);
      var pos = that.points[i].pos;
      var scaler = 1.0 / Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
      var rgb = Math.min(255, Math.floor(255.0*scaler*25));
      
      var color = colorLUT[rgb];
      
      FilledCircle(onScreen[0], onScreen[1], that.points[i].size * scaler, color);
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
  
   
  function Animate() {
    var newPoints = [];
    var elapsed = GetFrameTime();
    for (var i = 0; i < that.points.length; i++) {
      that.points[i].pos[2] -= velocity * elapsed * 0.1;
      
      if (StillVisible(that.points[i].pos)) {
        newPoints.push(that.points[i]);
      }
    }
    
    while (newPoints.length < pointCount) {
      newPoints.push(CreatePoint());
    }
    that.points = newPoints;
    
  }
  
  function FilledCircle(posx, posy, radius, color) {
    var ctx = GetContext();
    ctx.beginPath();
    var counterClockwise = false;
    ctx.arc(posx, posy, radius, 0, 2 * Math.PI, counterClockwise);
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
    prevTime = curTime;
    curTime = new Date().getTime();
    Draw();
    DrawOverlay();
    Animate();
  }
  
  this.Start = function() {
    GetCanvas().style.backgroundColor = bgColor;
    document.body.style.backgroundColor = "#0000FF";
    document.onkeydown = OnKeyDown;
    window.onresize = OnResize;
    OnResize();
    Init();
    tick();
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