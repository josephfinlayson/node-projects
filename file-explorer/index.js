var fs = require('fs'),
stdin = process.stdin,
stdout = process.stdout;

fs.readdir(__dirname,function(err,files){

	if(files.length == 0){
		return console.log("No file to show \n");
	}
	
	console.log('Select which file or directory you want to see \n');
	var stats = []
	function file(i){
		
		var filename=files[i];
		
		fs.stat(__dirname+"/" + filename, function(err,stat){
			stats[i] = stat
			if(stat.isDirectory()){
				console.log('	'+i+ '	' +filename);
			}else{
				console.log('	'+i+ '	' +filename);
			}
			
			if(++i == files.length){
				read();
			}else{
				file(i);
			}
		});
		
		function read(){
			console.log(" ");
			stdout.write(' enter your choice ');
			stdin.resume();
			stdin.on('data',option);
		
		}
	
		function option(data){
			var filename = files[Number(data)];
			if(!filename){
				stdout.write(' enter your choice ');
			}else{
				if(stats[Number(data)].isDirectory()){
					console.log(' ' + __dirname + " \t " + filename )
					fs.readdir(__dirname+"/"+filename,'utf8',function(err, files){
						console.log('  ( ' + files.length + ' files) ');
						files.forEach(function(file){
							console.log(' - ' + file );
						});
					});
				}else{
				
					fs.readFile(__dirname+"/"+filename,'utf8',function(err, data){
						console.log(' ');
						console.log('\033[90m]' + data.replace(/(.*)/g,'	$1' + '\033[90m]'));
					});
				}
				stdin.pause();
			}
		}
	}
	
	file(0);
});