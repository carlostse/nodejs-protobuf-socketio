var fs = require('fs')
  , app = require('express')()
  , http = require('http').Server(app)
  , io = require('socket.io')(http)
  , pb = require('./pb')
  , room = require('./room')
  , log = require('./log')
  , CONFIG_FILE = 'config.json';

// load config
var config = JSON.parse(fs.readFileSync(CONFIG_FILE))
if (!config){
  log.info('main', 'JSON.parse', 'config.json error');
  return;
}

// init a room for connections and users
var room = room.init(config);

var sendResp = function(socketId, resp){
  if (io.sockets && io.sockets.connected && io.sockets.connected[socketId]){
    var msg = pb.serialize(resp);
    if (msg) io.sockets.connected[socketId].emit('message', msg);
  }
};

// default home page
app.get('/', function(req, res){
  res.send('<h1>404 - Not Found</h1>');
});

// socket
io.on('connection', function(socket){
  log.info('main', 'connection', '{' + socket.id + '} connected');

  // send the channel list to client when connected
  room.list('Connected', socket, function(resp){
    sendResp(socket.id, resp);
  });

  // handle disconnect event
  socket.on('disconnect', function() {
    log.info('main', 'connection', '{' + socket.id + '} disconnected');
    room.leave(socket, function(resp){
      if (resp){
        // send feedback to all connected clients
        log.info('main', 'connection', 'broadcast leave');
        var msg = pb.serialize(resp);
        if (msg) io.sockets.emit('message', msg);
      }
    });
  });

  // handle join request
  socket.on('join', function(msg){
    var obj = pb.deserialize(msg);

    // decode failed
    if (!obj){
      log.info('main', 'join', 'parse failed');
      return;
    }

    // join channel
    if (obj.cmd == 'Connect'){
        room.join(socket, obj.channel, function(resp){
          // send feedback to all connected clients
          log.info('main', 'connection', 'broadcast join');
          var msg = pb.serialize(resp);
          if (msg) io.sockets.emit('message', msg);
        });
    } else if (obj.cmd == 'Leave'){
        room.leave(socket, function(resp){
          if (resp){
            // send feedback to all connected clients
            log.info('main', 'connection', 'broadcast leave');
            var msg = pb.serialize(resp);
            if (msg) io.sockets.emit('message', msg);
          }
        });
    } else {
        log.info('main', 'join', 'unknown command: ' + obj.cmd);
    }
  });

  // handle talk request
  socket.on('talk', function(msg){
    var obj = pb.deserialize(msg);

    // decode failed
    if (!obj){
      log.info('main', 'talk', 'parse failed');
      return;
    }

    room.talk(socket, obj.channel, function(resp){
      // send feedback
      var msg = pb.serialize(resp);
      if (msg) io.to(obj.channel).emit('message', msg);
    });
  });

  // handle voice request
  socket.on('voice', function(msg){
    var obj = pb.deserialize(msg);

    // decode failed
    if (!obj){
      log.info('main', 'talk', 'parse failed');
      return;
    }

    log.info('main', 'voice', '{' + socket.id + '} (' + obj.channel + ') ' +
                'size: ' + (obj.data? obj.data.length: -1));

    room.listUser(obj.channel).forEach(function(socketId, idx){
      if (idx == 0){
        // the 1st element is the sender
      } else if (socketId != socket.id){
        // send voice as data to clients
        log.info('main', 'voice', 'send {' + socketId + '}');
        sendResp(socketId, {
          cmd: 'Voice',
          channel: obj.channel,
          errno: 0,
          data: obj.data
        });
      } else {
        // just notify the sender with no data
        log.info('main', 'voice', 'send {' + socketId + '}');
        sendResp(socketId, {
          cmd: 'Voice',
          channel: obj.channel,
          errno: 0
        });
      }
    });
  });

});

http.listen(config.port, function(){
    log.info('main', 'http.listen', 'server is listening on port ' + config.port);
});