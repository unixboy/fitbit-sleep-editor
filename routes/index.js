/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'Sign into FitBit' });
};

exports.proxy = function(req, res) {
	var OAuth = require('oauth').OAuth;

	console.log('proxy for: ', req.url.substr('/proxy'.length));
	
	var oAuth = new OAuth(
		"http://api.fitbit.com/oauth/request_token",
		"http://api.fitbit.com/oauth/access_token", 
		FITBIT_CONSUMER_KEY, FITBIT_CONSUMER_SECRET, 
		"1.0", null, "HMAC-SHA1"
	);
	
	oAuth.get(
		"https://api.fitbit.com" + req.url.substr('/proxy'.length) + ".json",
		req.session.passport.user.token, req.session.passport.user.tokenSecret,
		function(error, data) {
			if (error) {
				console.log(require('sys').inspect(error));
				return;
			}
				
			data = JSON.parse(data);
			res.json(data);
		}
	);
};