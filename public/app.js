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
var dirtyPlayers = false;
var data = {players: {}};
var videoShooter;

var getScreenshot = function (callback, numFrames, interval, progressCallback) {
  if (videoShooter) {
    videoShooter.getShot(callback, numFrames, interval, progressCallback);
  } else {
    callback('');
  }
};

var gumHelper = GumHelper;
gumHelper.startVideoStreaming(function callback(err, stream, videoElement) {
  if (err) {
    throw err
  } else {
    videoElement.width = 135;
    videoElement.height = 101;
    document.body.appendChild(videoElement);
    videoElement.play();
    videoShooter = new VideoShooter(videoElement);
  }
});

window.socket = socket;

var context = a.getContext('2d');
context.fillStyle = '#333';

socket.on('message', function (newData) {
  dirtyPlayers = true;
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
  captureGamepad(socket);
  renderPlayers();
  // for canvases
  //a.width = a.width;
  requestAnimationFrame(render);
}

var gifContainer = document.querySelector('.gifs');
var gifElements  = {};

function renderPlayers () {
  if (dirtyPlayers) {
    dirtyPlayers = false;
    var players = Object.keys(data.players).forEach(function (id) {
      var player = data.players[id];

      // if a player has been added since last render, we need to add a new img element
      if (!gifElements[id]) {
        gifElements[id] = makeImg();
      }
      if (data.players[id].picture && gifElements[id].src !== data.players[id].picture) {
        gifElements[id].src = data.players[id].picture;
      }

      translateElement(gifElements[id], data.players[id].x, data.players[id].y);
    });
    // remove old images ?

  }
}

function makeImg () {
  var img = document.createElement('img');
  gifContainer.appendChild(img)
  return img;
}

function translateElement (element, x, y) {
  element.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
}

function captureGamepad(socket) {
  var pad;
  if (navigator.webkitGetGamepads == null) { return; }
  pad = navigator.webkitGetGamepads()[0];
  if (pad != null) {
    if (pad.buttons[6] === 1 || pad.buttons[0] === 1) {
        getScreenshot(function (picture) {
          socket.emit('enter', picture);
        });
    }
    if (pad.buttons[12] === 1 || pad.axes[1] < -0.6) {
      socket.emit('up');
    }
    if (pad.buttons[13] === 1 || pad.axes[1] > 0.6) {
      socket.emit('down');
    }
    if (pad.buttons[14] === 1 || pad.axes[0] < -0.6) {
      socket.emit('left');
    }
    if (pad.buttons[15] === 1 || pad.axes[0] > 0.6) {
      socket.emit('right');
    }
  }
}

render();
