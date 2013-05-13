
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  ,register = require('./routes/register')
  ,faq = require('./routes/faq')
  , http = require('http')
  , expressValidator = require('express-validator')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(expressValidator);
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



app.get('/',function (req, res) {
  res.render('index',
  { title : 'Welcome' }
  )
});
app.get('/register', function (req, res) {
  res.render('register',
  { title : 'Register' }
  )
});

app.get('/faq', function (req, res) {
  res.render('faq',
  { title : 'FAQ' }
  )
});


app.post('/register', function(req, res) {

  req.assert('username', 'Invalid postparam').notEmpty();
  req.assert('password', 'Invalid getparam').notEmpty();
  req.assert('email', 'Invalid urlparam').notEmpty();

  console.log(req.body)
  var errors = req.validationErrors();
  if (errors) {
    res.render('register',{errorMessage : errors, title: 'Failed Registration','username':req.body.username});
    return;
  }
  res.render('success',{name: req.body.username,
  						email: req.body.email,
						password: req.body.password,
						'title':'Display values',
						callback :true});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
