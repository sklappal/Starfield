function App() {
  
  var that = this;
  
  var pointCount = 500;
  var velocity = 1;
  
  var WIDTH = GetCanvas().width;
  var HEIGHT = GetCanvas().height;
  
  function CreatePoint() {
    return {pos: [100 * (Math.random() - 0.5), 100 * (Math.random() - 0.5), 200], size: Math.random() * 200};
  }
  
  function InitPoints() {
    that.points = [];
    for (var i = 0; i < pointCount; i++) {
      that.points.push(CreatePoint());
      that.points[i].pos[2] *= Math.random(); // Start with random Z
    }
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

    for (var i = 0; i < that.points.length; i++) {
      var onScreen = WorldToScreen(that.points[i].pos);
      var scaler = 1.0 / that.points[i].pos[2];
      var rgb = Math.min(255, Math.floor(255.0*scaler*25));
      
      var color = "rgb(" + rgb + ", " + rgb + ", " + rgb + ")";
      
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
    var lastTime = 0;
    var fps = 0;
    var fpsFilter = 0.01;
    var frameTime = 1.0/60.0 * 1000;
    
    return function() {
      var timeNow = new Date().getTime();
      if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        frameTime = (1-fpsFilter) * frameTime + fpsFilter * elapsed;
        fps = 1.0 / frameTime * 1000.0;
      }
      lastTime = timeNow;
      return fps;
    }
  }();
  
   
  function Animate() {
    var newPoints = [];
    for (var i = 0; i < that.points.length; i++) {
      that.points[i].pos[2] -= velocity;
      
      if (!StillVisible(that.points[i].pos)) {
        that.points[i] = CreatePoint();
      }
    }
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
    InitPoints();
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