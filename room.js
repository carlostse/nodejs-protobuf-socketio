// room

var log = require('./log');

exports.init = function(config){
  if (!config){
    log.info('room', 'init', 'config failed');
    return null;
  }

  return {
    config: config,
    room: {}, // channel: [users]
    user: {}, // record users' channel
    count: function(channel){
      // if no channel provided,
      // count num of channels
      if (!channel)
        return Object.keys(this.room).length;

      if (!this.room[channel])
        return 0;

      // the 1st element is not counted
      return this.room[channel].length - 1;
    },
    remove: function(channel){
      delete this.room[channel];
      log.info('room', 'remove', 'num of room(s): ' + this.count());
    },
    getRooms: function(){
      var list = [];
      if (this.room){
        var r = this;
        Object.keys(this.room).forEach(function(channel){
          list.push({
            channel: channel,
            count: r.count(channel)
          });
        });
      }
      return list;
    },
    list: function(cmd, socket, callback){
      var resp = {
        cmd: cmd,
        errno: 0,
        data: new Buffer(socket.id),
        room: this.getRooms()
      };
      if (callback) callback(resp);
    },
    listUser: function (channel){
      return this.room[channel];
    },
    join: function (socket, channel, callback){
      // check vacancy
      var cnt = this.count(channel);
      log.info('room', 'join', 'room (' + channel + ') current joined: ' + cnt);

      var resp = {
        cmd: 'Joined',
        channel: channel,
        errno: 0,
        count: cnt,
        data: null
      };

      if (cnt > this.config.maxUserPerChannel){
        log.info('room', 'join', 'room (' + channel + ') ' + cnt + ' > ' + config.maxUserPerChannel);
        if (callback){
          reply.errno = 1;
          callback(resp);
        }
        return;
      }

      // using socket channel
      log.info('room', 'join', '{' + socket.id + '} (' + channel + ')');
      socket.join(channel);

      // init an array in the channel
      if (!this.room[channel]){
        log.info('room', 'join', 'init room (' + channel + ')');
        this.room[channel] = [];
        // the 1st element is used to record the user who is talking
        this.room[channel][0] = '';
      }

      // append the client in the channel
      this.room[channel].push(socket.id);
      resp.count++;
      resp.data = new Buffer(socket.id);
      resp.room = this.getRooms();

      // record user's channel
      this.user[socket.id] = channel;

      log.info('room', 'join', 'room: ' + this.count());
      if (callback) callback(resp);
    },
    leave: function(socket, callback){
      // find user's channel
      // because user may kill the app
      // such that the app cannot send the channel to server
      var channel = this.user[socket.id];
      if (this.count(channel) < 1){
        log.info('room', 'leave', "cannot find user's channel");
        return;
      }

      // remove user from room
      // skip the 1st element
      if (this.room[channel]){
          for (var i = 1; i < this.room[channel].length; i++){
            if (this.room[channel][i] == socket.id){
              log.info('room', 'leave', 'remove {' + socket.id + '}, idx: ' + i);
              this.room[channel].splice(i, 1);
              break;
            }
          }
      }

      // count user in the room
      var cnt = this.count(channel);
      log.info('room', 'leave', '{' + socket.id + '} room (' + channel + ') count: ' + cnt);

      // remove empty room
      if (cnt < 1){
        log.info('room', 'leave', 'remove room (' + channel + ')');
        this.remove(channel);
      }
      log.info('room', 'leave', 'room: ' + this.count());

      if (callback) {
        this.list('Leave', socket, function(resp){
          if (resp.errno == 0){
            resp.channel = channel;
            resp.count = cnt;
          }
          callback(resp);
        });
      }
    },
    talk: function(socket, channel, callback){
      log.info('room', 'talk', '{' + socket.id + '} (' + channel + ')');
      var resp = {
        cmd: 'Talk',
        channel: channel,
        errno: 0,
        data: new Buffer(socket.id)
      };

      if (!this.room[channel]){
        log.info('room', 'talk', 'room (' + channel + ') not exist');
        resp.errno = 1;
        if (callback) callback(resp);
        return;
      }

      var talkingId = this.room[channel][0];
      if (talkingId.length > 0 && talkingId != socket.id){
        log.info('room', 'talk', 'room (' + channel + ') is occupied by ' + talkingId);
        resp.errno = 2;
        if (callback) callback(resp);
        return;
      }

      log.info('room', 'talk', '{' + socket.id + '} (' + channel + ') accepted');
      if (callback) callback(resp);
    }
  };
};