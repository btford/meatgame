var koa     = require('koa'),
    app     = koa(),
    common  = require('koa-common'),
    route   = require('koa-route');

app.use(common.favicon());
app.use(common.static(__dirname + '/public', {defer: true}));

var server  = require('http').Server(app.callback()),
    io      = require('socket.io').listen(server),
    model   = require('./model')();

model.players = {};

io.sockets.on('connection', function (socket) {
  var id = socket.id;

  model.players[id] = {};
  model.players[id].x = 1;
  model.players[id].y = 1;
  socket.on('left', function () {
    if (model.players[id].x > 1) model.players[id].x -= 1;
  });

  socket.on('right', function () {
    model.players[id].x += 1;
  });

  socket.on('down', function () {
    model.players[id].y += 1;
  });

  socket.on('up', function () {
    if (model.players[id].y > 1) model.players[id].y -= 1;
  });

  socket.on('disconnect', function () {
    delete model.players[id];
  });

  socket.on('enter', function (picture) {
    model.players[id].picture = picture;
  });
});

var resolvePath = require('./lib/resolve-path');

function tick () {
  var changed = model.diff();
  changed.length && io.sockets.emit('message', changed);
  setTimeout(tick, 16);
}


server.listen(3000);

tick();
