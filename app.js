var koa = require('koa'),
    app = koa(),
    common = require('koa-common'),
    route = require('koa-route');

app.use(common.favicon());
app.use(common.static(__dirname + '/public', {defer: true}));

var server = require('http').Server(app.callback()),
  io = require('socket.io').listen(server);

var model = require('./model')();

io.sockets.on('connection', function (socket) {
  socket.on('message', function () {
    model.x += 1;
    console.log(model.diff());
  });
});


function tick () {
  io.sockets.emit('message', {
    x: 1,
    y: 2
  });
  setTimeout(tick, 16);
}

server.listen(3000);
