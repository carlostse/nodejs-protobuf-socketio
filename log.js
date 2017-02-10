// log

var moment = require("moment");

var log = function(level, args){
  var d = moment().format("YYYY-MM-DD HH:mm:ss")
    , m = d + " " + level + " " + args[0] + " - [" + args[1] + "] " + args[2];
  console.log.apply(console, [m].concat(args.slice(3)));
};

exports.debug = function(){
  log("DEBUG", Array.prototype.slice.call(arguments));
};

exports.warn = function(){
  log("WARN ", Array.prototype.slice.call(arguments));
};

exports.info = function(){
  log("INFO ", Array.prototype.slice.call(arguments));
};

exports.error = function(){
  log("ERROR", Array.prototype.slice.call(arguments));
};