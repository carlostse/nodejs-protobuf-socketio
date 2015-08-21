// protocol buffer

var fs = require('fs')
  , MESSAGE_DESC = './data.desc'
  , MESSAGE_SCHEMA = 'demo.Message'
  , protobuf = require('node-protobuf')
  , log = require('./log')
  , pb = new protobuf(fs.readFileSync(MESSAGE_DESC));

exports.serialize = function(obj){
  try {
    return pb.serialize(obj, MESSAGE_SCHEMA);
  } catch (e) {
    log.error('pb', 'serialize', JSON.stringify(obj) + ' exception: ' + e);
    return null;
  }
};

exports.deserialize = function(b){
  try {
    return pb.parse(b, MESSAGE_SCHEMA);
  } catch (e) {
    log.error('pb', 'deserialize', JSON.stringify(b) + ' exception: ' + e);
    return null;
  }
};