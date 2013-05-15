/*
 * GET client-lookup listing.
 */

var OAuth = require('oauth').OAuth;

// Input Twitter users to fetch
exports.index = function(req, res){
	
	// /1/user/-/sleep/date/2010-02-21.json
	// timeInBed = minutesToFallAsleep + (minutesAsleep + minutesAwake) + minutesAfterWakeup

	var oAuth = new OAuth(
		"http://api.fitbit.com/oauth/request_token",
		"http://api.fitbit.com/oauth/access_token", 
		FITBIT_CONSUMER_KEY, FITBIT_CONSUMER_SECRET, 
		"1.0", null, "HMAC-SHA1"
	);
	
	oAuth.get(
		"https://api.fitbit.com/1/user/-/sleep/date/2012-11-01.json",
		req.session.passport.user.token, req.session.passport.user.tokenSecret,
		function(error, data) {
			if (error) {
				console.log(require('sys').inspect(error));
				return;
			}
				
			data = JSON.parse(data);
			console.log("sleep data", data);

			res.render('sleep-index', { title: 'Your days' });
		}
	);
	
};
 

// var fetchSleep = function fetchSleep(startDate, numDays, cb) {
	
// 	var startDate = new Date(startDate);
// 	if (!startDate) { console.log('error'); return; }
	
// 	// Loop asynchy
	
// };



// { sleep: 
//    [ { awakeningsCount: 5,
//        duration: 27600000,
//        efficiency: 98,
//        isMainSleep: true,
//        logId: 18911954,
//        minutesAfterWakeup: 0,
//        minutesAsleep: 451,
//        minutesAwake: 9,
//        minutesToFallAsleep: 0,
//        startTime: '2012-11-01T00:20:00.000',
//        timeInBed: 460 } ],
//   summary: 
//    { totalMinutesAsleep: 451,
//      totalSleepRecords: 1,
//      totalTimeInBed: 460 }
//  }

// https://wiki.fitbit.com/display/API/API-Log-Sleep
// https://wiki.fitbit.com/display/API/API-Delete-Sleep-Log

// https://wiki.fitbit.com/display/API/API-Get-Time-Series