var koa = require('koa'),
    app = koa(),
    common = require('koa-common'),
    route = require('koa-route');

app.use(common.favicon());
app.use(common.static(__dirname + '/public', {defer: true}));


var server = require('http').Server(app.callback()),
  io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  console.log(socket)
});
setInterval(function () {
  io.sockets.emit('message', {
    x: 1,
    y: 2
  });
}, 16);

server.listen(3000);
