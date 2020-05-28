window.Game = {};

(function(){
  function Rectangle(left, top, width, height) {
    this.left = left || 0;
    this.top = top || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
  }

  Rectangle.prototype.set = function (left, top, /*optional*/width, /*optional*/height) {
    this.left = left;
    this.top = top;
    this.width = width || this.width;
    this.height = height || this.height;
    this.right = (this.left + this.width);
    this.bottom = (this.top + this.height);
  }

  Rectangle.prototype.within = function (r) {
    return (r.left <= this.left &&
            r.right >=this.right &&
            r.top <= this.top &&
            r.bottom >= this.bottom);
  }

  Rectangle.prototype.overlaps = function (r) {
    return (this.left < r.right &&
            this.right > r.left &&
            this.top < r.bottom &&
            this.bottom > r.top);
  }

  Game.Rectangle = Rectangle;
})();

(function () {
  var AXIS = {
    NONE: "none",
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
    BOTH: "both"
  }

  function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
    this.xView = xView || 0;
    this.yView = yView || 0;

    this.xDeadZone = 0;
    this.yDeadZone = 0;

    this.wView = canvasWidth;
    this.hView = canvasHeight;

    this.axis = AXIS.BOTH;

    this.followed = null;

    this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);

    this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);
  }

  Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone) {
    this.followed = gameObject;
    this.xDeadZone = xDeadZone;
    this.yDeadZone = yDeadZone;
  }

  Camera.prototype.update = function() {
    if (this.followed != null) {
      if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH) {

        if (this.followed.x - this.xView + this.xDeadZone > this.wView)
          this.xView = this.followed.x - (this.wView - this.xDeadZone);

        else if (this.followed.x - this.xDeadZone < this.xView)
          this.xView = this.followed.x - this.xDeadZone;
      }

      if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH) {

        if (this.followed.y - this.yView + this.yDeadZone > this.hView)
          this.yView = this.followed.y - (this.hView - this.yDeadZone);

        else if (this.followed.y - this.yDeadZone < this.yView)
          this.yView = this.followed.y - this.yDeadZone;
      }
    }

    this.viewportRect.set(this.xView, this.yView);

    if (!this.viewportRect.within(this.worldRect)) {

      if (this.viewportRect.left < this.worldRect.left)
        this.xView = this.worldRect.left;

      if (this.viewportRect.right > this.worldRect.right)
        this.xView = this.worldRect.right - this.wView;

      if (this.viewportRect.top < this.worldRect.top)
        this.yView = this.worldRect.top;

      if (this.viewportRect.bottom > this.worldRect.bottom)
        this.yView = this.worldRect.bottom - this.hView;
    }
  }

  Game.Camera = Camera;

})();

(function() {
  function Player(x, y) {
    this.x = x;
    this.y = y;

    this.speed = 200;

    this.width = 30;
    this.height = 30;
  }

  Player.prototype.update = function(step, worldWidth, worldHeight) {

    if (Game.controls.left)
      this.x -= this.speed * step;
    if (Game.controls.up)
      this.y -= this.speed * step;
    if (Game.controls.right)
      this.x += this.speed * step;
    if (Game.controls.down)
      this.y += this.speed * step;
  }

  Player.prototype.draw = function(context, xView, yView) {
    context.save();
    context.fillStyle = "#E45641";

    context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);
    context.restore();
  }

  Game.Player = Player;
})();

(function() {
  function Map(width, height) {
    this.width = width;
    this.height = height;
    this.bricks = [];
    this.rows = 10;
    this.columns = 10;
    this.brickWidth = 100;
    this.brickHeight = 100;
    this.level = 0;
    this.map = [
      [
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1 ,1],
        [1, 0, 0, 1, 1, 0, 0, 0, 0 ,1],
        [1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0 ,1],
        [1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      [
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      [
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
        [1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1, 0, 1, 1],
        [1, 1, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      ]
    ]

    this.image = null;
  }

  Map.prototype.generate = function() {
    var ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = this.width;
    ctx.canvas.height = this.height;

    for (var r = 0; r < this.rows; r++) {
      this.bricks[r] = [];
      for (var c = 0; c < this.columns; c++) {
        this.bricks[r][c] = {
          x: 0,
          y: 0,
          status: this.map[this.level][r][c]
        }
      }
    }

    ctx.save();

    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.columns; c++) {
        if (this.map[this.level][r][c] == 1) {
          var brickX = (c * (this.brickWidth));
          var brickY = (r * (this.brickHeight));
          this.bricks[r][c].x = brickX + this.brickWidth / 2;
          this.bricks[r][c].y = brickY + this.brickHeight / 2;

          ctx.beginPath();
          ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
          ctx.fillStyle = "#44B3C2";
          ctx.fill();
          ctx.closePath();
        }
      }
    }
    ctx.restore();

    this.image = new Image();
    this.image.src = ctx.canvas.toDataURL("image/png");

    ctx = null;
  }

  Map.prototype.set = function(level) {
    this.level = level;
  }

  Map.prototype.draw = function(context, xView, yView) {
    var sx, sy, dx, dy;
    var sWidth, sHeight, dWidth, dHeight;

    sx = xView;
    sy = yView;

    sWidth = context.canvas.width;
    sHeight = context.canvas.height;

    if (this.image.width - sx < sWidth) {
      sWidth = this.image.width - sx;
    }
    if (this.image.height - sy < sHeight) {
      sHeight = this.image.height - sy;
    }

    dx = 0;
    dy = 0;
    dWidth = sWidth;
    dHeight = sHeight;

    context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  Game.Map = Map;
})();

(function() {
  function Time() {
    this.font = "16px Courier New";
    this.count = 0;
  }

  Time.prototype.update = function(time) {
    this.count = time;
  }

  Time.prototype.draw = function(context) {
    context.save();
    context.font = this.font;
    context.fillStyle = "black";
    context.fillText("Time-left: " + this.count, 8, 20);
    context.restore();
  }

  Game.Time = Time;
})();

(function() {
  function Level() {
    this.font = "16px Courier New";
    this.level = 1;
  }

  Level.prototype.update = function(level) {
    this.level = level;
  }

  Level.prototype.draw = function(context) {
    context.save();
    context.font = this.font;
    context.fillStyle = "black";
    context.fillText("Level: " + this.level, 315, 20);
    context.restore();
  }

  Game.Level = Level;
})();

(function() {
  var canvas = document.getElementById("drawBoard");
  var context = canvas.getContext('2d');

  var FPS = 30;
  var INTERVAL = 1000 / FPS;
  var STEP = INTERVAL / 1000;

  var room = {
    width: 1000,
    height: 1000,
    map: new Game.Map(1000, 1000)
  };

  room.map.generate();

  var player = new Game.Player(room.width - 150, room.height - 150);

  var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);
  camera.follow(player, canvas.width / 2, canvas.height / 2);

  var time = new Game.Time();
  var level = new Game.Level();
  var counter = 30;
  var redundantCounter = 30;
  var fps = 0;

  var collision = function() {
    for (r = 0; r < room.map.rows; r++) {
      for (c = 0; c < room.map.columns; c++) {
        var b = room.map.bricks[r][c];
        var block = room.map;
        if (b.status == 1) {
          if (player.x + player.width / 2 > b.x - block.brickWidth / 2 &&
            player.x - player.width / 2 < b.x + block.brickWidth / 2 &&
            player.y + player.height / 2 > b.y - block.brickHeight / 2 &&
            player.y - player.height / 2 < b.y + block.brickHeight / 2) {

              if (player.x > b.x + block.brickWidth / 2) {
                player.x = b.x + block.brickWidth / 2 + player.width / 2;
              }
              if (player.x < b.x - block.brickWidth / 2) {
                player.x = b.x - block.brickWidth / 2 - player.width / 2;
              }
              if (player.y > b.y + block.brickHeight / 2) {
                player.y = b.y + block.brickHeight / 2 + player.height / 2;
              }
              if (player.y < b.y - block.brickHeight / 2) {
                player.y = b.y - block.brickHeight / 2 - player.height / 2;
              }
          }
        }
      }
    }
  }

  var nextLevel = function() {
    var levelOn = room.map.level;
    if (player.y + player.height / 2 < 0) {
      levelOn += 1;
      redundantCounter -= 5;
      counter = redundantCounter;
      room.map.set(levelOn);
      room.map.generate();
      player.x = room.width - 150;
      player.y = room.height - 150;
      Game.controls.up = false;
    }
  }

  var update = function() {
    fps++;
    time.update(counter);
    level.update(room.map.level + 1);
    collision();
    player.update(STEP, room.width, room.height);
    camera.update();

    if (fps == FPS) {
      counter--;
      fps = 0;
    }

    if (counter == -1){
      alert("Game Over.");
      document.location.reload();
    }

    if (room.map.level == 3) {
      if (player.y - player.height / 2 > room.map.height) {
        alert("You Won!");
        window.location.reload();
      }
    }
  }

  var draw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    room.map.draw(context, camera.xView, camera.yView);
    player.draw(context, camera.xView, camera.yView);
    time.draw(context);
    level.draw(context);
  }

  var gameLoop = function() {
    update();
    draw();
    nextLevel();
  }

  Game.play = function(){
    setInterval(function() {
      gameLoop();
    }, INTERVAL);
  }
})();

Game.controls = {
  left: false,
  up: false,
  right: false,
  down: false
}

window.addEventListener("keydown", function(e){
    switch(e.keyCode)
    {
        case 37: // left arrow
            Game.controls.left = true;
            break;
        case 38: // up arrow
            Game.controls.up = true;
            break;
        case 39: // right arrow
            Game.controls.right = true;
            break;
        case 40: // down arrow
            Game.controls.down = true;
            break;
    }
}, false);

window.addEventListener("keyup", function(e){
    switch(e.keyCode)
    {
        case 37: // left arrow
            Game.controls.left = false;
            break;
        case 38: // up arrow
            Game.controls.up = false;
            break;
        case 39: // right arrow
            Game.controls.right = false;
            break;
        case 40: // down arrow
            Game.controls.down = false;
            break;
    }
}, false);

window.onload = Game.play();
