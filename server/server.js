// HTTP and HTTPS Static File Server
var fs = require('fs'),
	http = require('http'),
  https = require('https'),
  express = require('express'),
  path = require('path');

var port = process.env.VIRTRU_SECURE_READER_PORT || 80;
var portSSL = process.env.VIRTRU_SECURE_READER_PORTSSL || 443;

var options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/server.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/server.crt'))
};

var app = express();
app.use(express.static(path.join(__dirname, '../simple')));

https.createServer(options, app).listen(portSSL, function() {
  console.log('Express server listening on port ' + portSSL);
});

var server = http.createServer(app, function(req, res) {
  res.writeHead(301, {
    'Content-Type': 'text/plain',
    'Location': 'https://' + req.headers.host + req.url
  });
  res.end();
});
server.listen(port, function() {
  console.log('HTTP Redirect ' + port);
});

module.exports = server;
