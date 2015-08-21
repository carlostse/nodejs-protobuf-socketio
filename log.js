// log

var moment = require('moment');

function log(lvl, cls, ftn, msg){
  var d = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log(d + ' ' + lvl + ' ' + cls + ' - [' + ftn + '] ' + msg);
}

exports.info = function(cls, ftn, msg){
  log('INFO ', cls, ftn, msg);
}

exports.error = function(cls, ftn, msg){
  log('ERROR', cls, ftn, msg);
}