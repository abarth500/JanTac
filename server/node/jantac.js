/* require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
}); */

console.log("JanTac Server Module");
var fs = require("fs");
var conf = JSON.parse(fs.readFileSync("../conf/jantac.json","utf-8"));
if(conf['WOL']){
	console.log("[Wake On Lan]");
	var wol = require('wake_on_lan');
	for(var c in conf['macAddresses']){
		console.log(' ->'+conf['macAddresses'][c]);
		wol.wake(conf['macAddresses'][c],{"address":conf['broadcastAddress']});
	}
}
console.log("[Echo Server]");
var net = require('net');
var server = net.createServer(
	function(socket){
			socket.on('connect',function(){
				console.log(" -> Connect from " + socket.remoteAddress)
			});
			socket.on('data', function(data){
				socket.write(data);
		});
	}
);
server.listen(conf['echoPort']);
console.log("[WebSocket Server]");
var ws = require(__dirname+require('path').sep+'jantac-ws.js');
ws.startWabSocket(conf);
console.log("[Init done]");
console.log("[Start browser]");
var exec = require('child_process').exec;
console.log(" ->command: "+conf["browser"] + "http://" + conf["serverAddress"]+"/server.html");
return exec(conf["browser"] + "http://" + conf["serverAddress"]+"/server.html", {timeout: 1000},
	function(error, stdout, stderr) {
		console.log('stdout: '+(stdout||'none'));
		console.log('stderr: '+(stderr||'none'));
		if(error !== null) {
			console.log('exec error: '+error);
		}
	}
);