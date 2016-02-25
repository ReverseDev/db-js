/**
 * Client mock class
 */
function Client() {}

Client.prototype.connect = function(callback) {
  callback(null, this, function() {});
};

Client.prototype.query = function(query, values, callback) {
  if (typeof values === 'function') {
    callback = values;
  }

  var rows = [{
    id: 42
  }];

  callback(null, {
    rows: rows
  });
};

Client.prototype.end = function() {};

module.exports = Client;
