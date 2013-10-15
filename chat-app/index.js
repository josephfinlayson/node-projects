var net = require('net')
var count =0, user = {}
var server = net.createServer(function(conn){
	conn.write(
					'\n welcome to node-chat \n '+ count +' other people are connected' + '\n please write your name and start');
	count++;				
	conn.setEncoding('utf8');
	var nickname;
	
	conn.on('data', function(data){
		
		data = data.replace('\r\n','');
		if (!nickname){
			if(user[data]){
				conn.write("\n nickname already in use. ");
				return;
			}else{
				nickname = data;
				user[nickname] = conn;
				for(var i in user){
					user[i].write('\n Hello !!' + nickname + ' joined the room');
				}
			}
		}else{
			for (var i in user){
				if(i != nickname){
					user[i].write('\n ' + nickname +" said " + data);
				}
			}
		}
		console.log(data);
	});
	conn.on('close', function(){
		count --;
		delete user[nickname];
		broadcast(nickname +" has left the room", true)
	});
	
	function broadcast(msg,expectMyself){
		for (var i in user){
			if( !expectMyself || i != nickname){
				user[i].write(msg);
			}
		}
	}
});



server.listen(3000,function(){
	console.log('\033[96m LISTENING \033[39m');	
});

