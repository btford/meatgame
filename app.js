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
    io.sockets.emit('message', changed.reduce(function (obj, path) {
      obj[path] = model[path];
      return obj;
    }, {}));
  }
  setTimeout(tick, 16);
}

server.listen(3000);

tick();
