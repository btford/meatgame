var koa = require('koa'),
    app = koa(),
    common = require('koa-common'),
    route = require('koa-route');

app.use(common.favicon());
app.use(common.static(__dirname + '/public', {defer: true}));

var server = require('http').Server(app.callback()),
  io = require('socket.io').listen(server);

var model = require('./model')();

model.x = 1;
model.y = 1;

io.sockets.on('connection', function (socket) {
  socket.on('message', function () {
    model.x += 1;
    model.y += 1;
  });
});


function tick () {
  var changed = model.diff();

  if (changed.length) {
    io.sockets.emit('message', changed.map(function (path) {
      return {
        key: path,
        value: resolvePath(path, model)
      };
    }));
  }
  setTimeout(tick, 16);
}

// TODO(btford): move to model.js
function resolvePath (path, obj) {
  path = path.split('.');
  var segment;
  while (path.length && (segment = path.shift())) {
    if (obj[segment]) {
      obj = obj[segment];
    } else {
      return;
    }
  }
  return obj;
}

server.listen(3000);

tick();
