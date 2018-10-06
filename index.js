
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

var numUsers = 0;

function onConnection(socket) {
  ++numUsers;
  console.log("Player joined");
  socket.on('draw', function(data) {
  	i = data.i;
  	j = data.j;
  	c = data.c;
  	if (game) {
  		grid[i][j].space = c;
  	}
  	io.emit('draw', data)
  });
  socket.on('grid', () => socket.emit('grid', grid));
  socket.on('disconnect', function() {
    console.log("Player disconnected");
    if (--numUsers == 0) {
      console.log("Game reset!");
      createGrid();
    }
  });
}

io.on('connection', onConnection);

function min(a, b) {
	if (a < b) {
		return a;
	} else {
		return b;
	}
}

function max(a, b) {
	if (a > b) {
		return a;
	} else {
		return b;
	}
}

var grid;
var game = false;
var gridSize = 22;
var foodCount = 10;

createGrid();


function spawnFood() {
  var gline = grid[(Math.random() * grid.length) | 0];
  var hex = gline[(Math.random() * gline.length) | 0];
  while (hex.space != 2/*"empty"*/) {
    gline = grid[(Math.random() * grid.length) | 0];
    hex = gline[(Math.random() * gline.length) | 0];
  }
  hex.space = 3/*"food"*/;
}

function Hex(i, j, type) {
  this.space = type;
  this.i = i;
  this.j = j;
}

function createGrid() {
  grid = []
  for (var i = 0; i < gridSize*2+1; i++) {
    var gridLine = [];
    for (var j = 0; j < gridSize*2+1; j++) {
      var t = 0/*"none"*/;
      if (i+j > gridSize-1 && i+j < gridSize*3+1) {
        if (min(i, j) == 0 || max(i, j) == gridSize*2 || i+j == gridSize || i+j == gridSize*3) {
          t = 1/*"wall"*/;
        } else {
          t = 2/*"empty"*/;
        }
      } 
      gridLine.push(new Hex(i, j, t));
    }
    grid.push(gridLine);
  }
  game = true;
  for (var i = 0; i < foodCount; i++) {
    spawnFood();
  }
}

http.listen(port, () => console.log('listening on port ' + port));
