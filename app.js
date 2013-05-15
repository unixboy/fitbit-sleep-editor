// Configure me
FITBIT_CONSUMER_KEY = '4b5850cfd39e46c1afb0ffb082b2cb45';
FITBIT_CONSUMER_SECRET = 'dca8dbfc141748d8822d07d6163f693b';
// HOST = 'http://fitbit-sleep-editor.hp.af.cm'; 
HOST = 'http://local.jeremiahlee.com:3000';

var express = require('express'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	FitbitStrategy = require('passport-fitbit').Strategy;

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('sleeping-is-healthy'));
	app.use(express.session());
	app.use(passport.initialize());
	app.use(passport.session()); 
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
passport.use(
	new FitbitStrategy({
		consumerKey: FITBIT_CONSUMER_KEY,
		consumerSecret: FITBIT_CONSUMER_SECRET,
		callbackURL: HOST + "/auth/fitbit/callback"
	},
	function(token, tokenSecret, profile, done) {
		// Assemble user object. Only use it for browser session, so not storing.
		var user = {
			token: token,
			tokenSecret: tokenSecret, 
			profile: profile
		};
		
		// Callback done
		console.log('done', user);
		done(null, user);
	}
));

app.get('/', routes.index);
app.get(/^\/proxy\//, routes.proxy);

// Redirect the user to FitBit for authentication.
// When complete, FitBit will redirect the user back to the application at /auth/fitbit/callback
app.get('/auth/fitbit', passport.authenticate('fitbit'));

// FitBit will redirect the user to this URL after approval.  Finish the authentication process by attempting to obtain an access token.
// If access was granted, the user will be logged in.  Otherwise, authentication has failed.
app.get('/auth/fitbit/callback', 
	passport.authenticate('fitbit', 
		{
			successRedirect: '/edit.html',
			failureRedirect: '/'
		}
	)
);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});