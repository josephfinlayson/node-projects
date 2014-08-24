function twitFunc(req, res) {
	console.log("twitFunc being called")
    // T.post('statuses/update', { status: 'Learning nodejs' }, function(err, data, response) {
    //  		  console.log("data : " +data);
    // 		  console.log("err : " + err);
    // 		  console.log("response : " + response.statusCode );
    //  		});
    var status = [];
    T = new Twit({
        consumer_key: '1iiHEvtWK3f1Wk6s9r7I1TKwi',
        consumer_secret: 'p3nMatoxzJHIHEjKwqCwVJeauNE7meatpuTOTOxOeZ2CiLis2O',
        access_token: req.user.twitter.token,
        access_token_secret: req.user.twitter.tokenSecret
    });

    stream = T.stream('statuses/filter', {
        locations: [-122.75, 36.8, -121.75, 37.8]
    });
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

    stream.on('reconnect', function(request, response, connectInterval) {
        console.log('Trying to reconnect to Twitter API in ' + connectInterval + ' ms');

    });

    stream.on('tweet', function(tweet) {

        if (tweet.place == null) {
            return;
        }

        //Create message containing tweet + location + username + profile pic
        var msg = {};
        msg.text = tweet.text;
        msg.location = tweet.place.full_name;
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
        user: req.user
    });
    // res.render('success.html',{
    // 			user : req.user
    // 		});
}

module.exports = twitFunc;
