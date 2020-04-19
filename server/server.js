// MIT License
// 
// Copyright (c) 2019 Virtru Corporation
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// HTTP and HTTPS Static File Server
var fs = require('fs'),
	http = require('http'),
  https = require('https'),
  express = require('express'),
  path = require('path'),
  multer  = require('multer'),
  upload = multer({ dest: 'uploads/' });

var port = process.env.VIRTRU_SECURE_READER_PORT || 80;
var portSSL = process.env.VIRTRU_SECURE_READER_PORTSSL || 443;

var options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/server.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/server.crt'))
};

var app = express();
app.use(express.static(path.join(__dirname, '../simple')));


app.post('/upload', upload.single('file'), (req, res, next) => {
  const file = req.file;

  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }
  console.log('Uploading: ', file);
  res.send('resp')
  
});


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
