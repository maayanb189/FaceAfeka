var myGamePiece;
var myObstacles = [];
var players = [];
var socket = io();
var parent;

socket.on('player added', data => {
    var name = document.createElement("p");
    name.setAttribute("style", "color:" + data.color);
    name.textContent = data.user_name;
    var br = document.createElement("br");
    parent.appendChild(name);
    parent.appendChild(br);
});

socket.on('waiting', num => {
    console.log(num);
    document.getElementById("waiting").textContent = "waiting for more " + num + " players";
});

socket.on('start game', () => {
    document.getElementById("waiting").textContent = "";
    myGameArea.start();
});

socket.on('finish', players => {
    console.log(players);
    list = document.getElementById("players");
    document.getElementById("name").textContent = "";
    var max;
    players.forEach(element => {
        var el = document.createElement("h1");
        el.setAttribute("style", "color:" + element.color);
        el.textContent = element.name + " points: " + element.score;
        if (max == undefined || element.score > max.score) {
            max = element;
        }
        list.appendChild(el);
    });
    var winner = document.createElement("h1");
    winner.setAttribute("style", "color:" + max.color);
    winner.textContent = max.name + " WON!!!!!";
    list.appendChild(winner);
});


function startGame() {
    document.getElementById("move").hidden = true;
    myGameArea.createCanvas();
    myScore = new component("30px", "Consolas", "black", 280, 40, "text");
}

function component(width, height, color, x, y, type) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.color = color
    this.update = function () {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function () {
            this.x += this.speedX;
            this.y += this.speedY;
        },
        this.crashWith = function (otherobj) {
            var myleft = this.x;
            var myright = this.x + (this.width);
            var mytop = this.y;
            var mybottom = this.y + (this.height);
            var otherleft = otherobj.x;
            var otherright = otherobj.x + (otherobj.width);
            var othertop = otherobj.y;
            var otherbottom = otherobj.y + (otherobj.height);
            var crash = true;
            if ((mybottom < othertop) ||
                (mytop > otherbottom) ||
                (myright < otherleft) ||
                (myleft > otherright)) {
                crash = false;
            }
            return crash;
        }
}

function getReady() {
    parent = document.getElementById("info");
    var child = document.getElementById("input");
    var user_name = document.getElementById("name").value;
    parent.removeChild(child);
    socket.emit('new player', user_name);
    socket.on('color', color => {
        var name = document.getElementById("name");
        name.setAttribute("style", "color:" + color);
        myGamePiece = new component(30, 30, color, 10, 120);
        name.textContent = user_name;
        /*parent.appendChild(name);
        parent.appendChild(br);*/
    });
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    createCanvas: function () {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    },
    start: function () {
        document.getElementById("move").hidden = false;
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        clearInterval(this.interval);
        socket.emit('end game', this.frameNo);
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {
        return true;
    }
    return false;
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myGameArea.stop();
            return;
        }
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new component(10, height, "green", x, 0));
        myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}

function moveup() {
    myGamePiece.speedY -= 1;
}

function movedown() {
    myGamePiece.speedY += 1;
}

function moveleft() {
    myGamePiece.speedX -= 1;
}

function moveright() {
    myGamePiece.speedX += 1;
}

function stopMove() {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}