
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game, xloc, yloc, savedType) {
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.type = savedType || {it : false, frozen : false, isDoctor : false};
    if(this.type.it == true){
        this.setIt();
    } else if(this.type.isDoctor == true){
        this.setDoctor();
    } else if(this.type.frozen == true){
        this.setFrozen();
    } else {
        this.setNotIt();
    }
    this.x = xloc || this.radius + Math.random() * (800 - this.radius * 2);
    this.y = yloc || this.radius + Math.random() * (800 - this.radius * 2)
    Entity.call(this, game, this.x, this.y);

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    this.type = {it : true, frozen : false, isDoctor : false}
    this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setDoctor = function () {
    this.type = {it : false, frozen : false, isDoctor : true}
    this.color = 1;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.type = {it : false, frozen : false, isDoctor : false}
    this.color = 3;
    this.visualRadius = 200;
};

Circle.prototype.setFrozen = function () {
    this.type = {it : false, frozen : true, isDoctor : false}
    this.color = 2;
    this.visualRadius = 10;
    //this.velocity = 1;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);
    if(this.type.frozen){
        this.x += 0;
        this.y += 0;
    }else{
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    }
    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }


    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

           
            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;

            if (this.type.it && ent.type.isDoctor !== true) {
                //this.setNotIt();
                ent.setFrozen();
            }
            else if (this.type.isDoctor && ent.type.it !== true) {
                //this.setIt();
                ent.setNotIt();
            }
        }

        //collisions
        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.type.it && dist > this.radius + ent.radius + 10 && ent.type.frozen != true && ent.type.isDoctor != true) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.type.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (this.type.isDoctor && dist > this.radius + ent.radius + 10 && ent.type.frozen == true) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;
var list = [];

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

window.onload = function () {
    var socket = io.connect("http://24.16.255.56:8888");
  
    socket.on("load", function (data) {
        //console.log(data.data);
        gameEngine.entities = [];
        for(i = 0; i<data.data.length; i++){
            var circle = new Circle(gameEngine, data.data[i].x, data.data[i].y, data.data[i].type);
            gameEngine.addEntity(circle);
        }
    });
  
    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");
  
    saveButton.onclick = function () {
      console.log("save");
      text.innerHTML = "Saved."
      for(i = 0; i<gameEngine.entities.length; i++){
        gameEngine.list.push({x: gameEngine.entities[i].x, y: gameEngine.entities[i].y, type: gameEngine.entities[i].type})
    }
      socket.emit("save", { studentname: "Ross Martsenyak", statename: "BallState", data: gameEngine.list });
    };
  
    loadButton.onclick = function () {
      console.log("load");
      text.innerHTML = "Loaded."
      socket.emit("load", { studentname: "Ross Martsenyak", statename: "BallState" });
    };

    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    ASSET_MANAGER.downloadAll(function () {
        
        var circle = new Circle(gameEngine);
        circle.setIt();
        gameEngine.addEntity(circle);
        for (var i = 0; i < 12; i++) {
            circle = new Circle(gameEngine);
            gameEngine.addEntity(circle);
        }
        //Create Doctor 
        circle = new Circle(gameEngine);
        circle.setDoctor();
        gameEngine.addEntity(circle);

        console.log(gameEngine.list);
        gameEngine.init(ctx);
        gameEngine.start();
    });
  
  };

// the "main" code begins here



