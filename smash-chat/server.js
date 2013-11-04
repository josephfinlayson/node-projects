var express = require('express')
  , sio = require('socket.io'),request = require('superagent');
  
app = express.createServer(
    express.bodyParser()
  , express.static('public')
);

app.listen(3000);	
var io  = sio.listen(app),dj,currentSong,apiKey = '{3abe68d5b2ca6f292a11aefe66218e33}';
	
io.sockets.on('connection',function(socket){
	console.log('Connected');
	socket.on('join', function (name) {
			console.log('Join event called ' + name);
		socket.nickname = name;
		socket.broadcast.emit('announcement' , name + ' joined the chat');
		console.log('Done with join');
	});
	socket.on('text', function(msg, fn){
	
		socket.broadcast.emit('text',socket.nickname,msg);
		fn(Date.now());
		if(!dj){
			elect(socket);
		}else{
			socket.emit('song',currentSong);
		}
	});
	
	socket.on('search',function(q,fn){
		console.log('http://tinysong.com/s/'+encodeURIComponent(q)+"?key=3abe68d5b2ca6f292a11aefe66218e33&format=json");
		request('http://tinysong.com/s/'+encodeURIComponent(q)+"?key=3abe68d5b2ca6f292a11aefe66218e33&format=json", function(res){
			console.log("text : " + res.text);
			if(200 == res.status) 
				fn(JSON.parse(res.text));
		});
	})
	
});

function elect(socket){
	dj = socket;
	io.sockets.emit('announcement', socket.nickname +" is the dj");
	socket.emit('elected');
	socket.dj = true;
	socket.on('disconnect', function(){
		
		dj = null;
		io.sockets.emit('announcement', 'the dj left the room . ');
	});
	
 socket.on('song',function(song){
	 if(song.dj){
		 currentSong = song;
		 socket.broadcast.emit('song',song);
	 }
 });	
}