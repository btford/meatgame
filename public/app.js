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
var socket = io.connect('http://localhost:3000');
var dirty = false;
var data = {x: 0, y: 0};

var context = a.getContext('2d');
context.fillStyle = '#333';

socket.on('message', function (newData) {
  dirty = true;
  data = newData;
});

function render () {
  if (dirty) {
    dirty = false;
    a.width = a.width;
    context.fillRect(data.x, data.y, 50, 50);
  }
  requestAnimationFrame(render);
}

render();
