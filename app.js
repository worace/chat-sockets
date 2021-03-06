var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require("redis");


var routes = require('./routes/index');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server, {origins: '*:*'});
io.on('connection', function(){
    console.log("connected client")
});

server.listen(4200);

var redisClient = redis.createClient();
//note "message" in .on("message") here is is the type of event
//we are attaching a notif to (rather than a channel or other identifier)
//specific channel is handled with subscribe event below
redisClient.on("message", function(channel, message) {
    console.log("node received message on channel ", channel);
    console.log("msg: ", message);
    io.emit("message", message)
});

//"messages" here denotes which redis channel we are subbing to
redisClient.subscribe("messages");



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
