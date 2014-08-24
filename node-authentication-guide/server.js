// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var configDB = require('./config/database.js');
var Twit = require('twit');
var T ;
var  path = require('path');
var stream ;
//'statuses/user_timeline',{}
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'jade'); // set up ejs for templating
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
//require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
console.log('The magic happens on port ' + port);

var server = app.listen(port);
var io = require('socket.io').listen(server);	
//twitter stream begin 

var TWEETS_BUFFER_SIZE = 3;
var SOCKETIO_TWEETS_EVENT = 'tweet-io:tweets';
var SOCKETIO_START_EVENT = 'tweet-io:start';
var SOCKETIO_STOP_EVENT = 'tweet-io:stop';
var nbOpenSockets = 0;
var isFirstConnectionToTwitter = true;
var tweetsBuffer = [];
var oldTweetsBuffer = [];

var handleClient = function(data, socket) {
	if (data == true) {
		console.log('Client connected !');
		
		if (nbOpenSockets <= 0) {
			nbOpenSockets = 0;
			console.log('First active client. Start streaming from Twitter');
			stream.start();
		}

		nbOpenSockets++;

		//Send previous tweets buffer to the new client.
		if (oldTweetsBuffer != null && oldTweetsBuffer.length != 0) {
			socket.emit(SOCKETIO_TWEETS_EVENT, oldTweetsBuffer);
		}
	}
};

io.sockets.on('connection', function(socket) {

	socket.on(SOCKETIO_START_EVENT, function(data) {
		handleClient(data, socket);
	});

	socket.on(SOCKETIO_STOP_EVENT, discardClient);

	socket.on('disconnect', discardClient);
});


//Handle Twitter events


var broadcastTweets = function() {
	//send buffer only if full
	if (tweetsBuffer.length >= TWEETS_BUFFER_SIZE) {
		//broadcast tweets
		io.sockets.emit(SOCKETIO_TWEETS_EVENT, tweetsBuffer);
		
		oldTweetsBuffer = tweetsBuffer;
		tweetsBuffer = [];
	}
}
var discardClient = function() {
	console.log('Client disconnected !');
	nbOpenSockets--;

	if (nbOpenSockets <= 0) {
		nbOpenSockets = 0;
		console.log("No active client. Stop streaming from Twitter");
		stream.stop();
	}
};
///////twitter stream/////////






// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		// res.sendFile('./public/index.html');
		res.render('index.jade');
	});

	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		var status = [];
		 T = new Twit({
		    consumer_key:         'xx'
		  , consumer_secret:      'xx'
		  , access_token:         req.user.twitter.token
		  , access_token_secret:  req.user.twitter.tokenSecret
		});

		stream = T.stream('user', {});
		stream.on('connect', function(request) {
			console.log('Connected to Twitter API');

			if (isFirstConnectionToTwitter) {
				isFirstConnectionToTwitter = false;
				console.log("stopping the stream");
				stream.stop();
			}
		});

		stream.on('disconnect', function(message) {
			console.log('Disconnected from Twitter API. Message: ' + message);
		});

		stream.on('reconnect', function (request, response, connectInterval) {
		  	console.log('Trying to reconnect to Twitter API in ' + connectInterval + ' ms');

		});

		T.get("statuses/user_timeline",{}, function(err, data, response) {
			console.log(err);
			console.log(response);
			console.log(data);
		});
		stream.on('tweet', function(tweet) {
			//Create message containing tweet + location + username + profile pic
			var msg = {};
			msg.text = tweet.text;
			// msg.location = tweet.place.full_name;
			msg.user = {
				name: tweet.user.name, 
				image: tweet.user.profile_image_url
			};

			//push msg into buffer
			tweetsBuffer.push(msg);
			console.log("broadcastTweets");
			broadcastTweets();
		});
		res.render('profile.jade', {
			user : req.user
		});
		
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
 		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
