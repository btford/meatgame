// shim
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// connect
var socket = io.connect();
var dirty = false;
var data = {players: {}};
var playerCanvas = window['player-canvas'];
var backgroundCanvas = window['background-canvas'];

window.socket = socket;

var context = playerCanvas.getContext('2d');
context.fillStyle = '#333';

var backgroundContext = backgroundCanvas.getContext('2d');

socket.on('message', function (newData) {
  dirty = true;
  newData.forEach(function (datum) {
    setPath(datum.key, datum.value, data);
  });
});

function setPath (path, value, obj) {
  path = path.split('.');
  var segment;
  while (path.length > 1 && (segment = path.shift())) {
    obj = obj[segment] || (obj[segment] = {});
  }
  obj[path[0]] = value;
}

function render () {
  renderPlayers();
}

function renderPlayers() {
  if (dirty) {
    dirty = false;
    playerCanvas.width = playerCanvas.width;
    var players = Object.keys(data.players).forEach(function (id) {
      var player = data.players[id];
      context.fillRect(player.x, player.y, 50, 50);
    });
  }
  requestAnimationFrame(render);
}

var img_map = new Image();
img_map.src = ('/images/bee_person.jpg');

img_map.onload = function paintBackgroundCanvas() {
  backgroundCanvas.width = img_map.width;
  backgroundCanvas.height = img_map.height;
  backgroundContext.drawImage(img_map, 0, 0)
};

render();
