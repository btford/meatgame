(function (window) {

// keycodes are lame
// http://unixpapa.com/js/key.html

var keysWeCareAbout = {
  '37': 'left',
  '38': 'up',
  '39': 'right',
  '40': 'down'
};

var keyState = window.keyState = {};

window.addEventListener('keydown', function (ev) {
  var name = keysWeCareAbout[ev.keyCode.toString()];
  if (name) {
    window.socket.emit(name);
    keyState[name] = true;
  }
});

window.addEventListener('keyup', function (ev) {
  var name = keysWeCareAbout[ev.keyCode.toString()];
  if (name) {
    keyState[name] = false;
  }
});

}(window));
