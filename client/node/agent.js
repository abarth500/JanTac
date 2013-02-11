console.log("JanTac Client Module");

var exec = require('child_process').exec,cmd,shutdown,onShutdown; 
cmd = 'shutdown -s -t 0'; 
onShutdown = false;
shutdown = function() {
	if(!onShutdown){
		onShutdown = true;
		console.log("[Shutdown process]");
	    return exec(cmd, {timeout: 1000},
	        function(error, stdout, stderr) {
	            console.log('stdout: '+(stdout||'none'));
	            console.log('stderr: '+(stderr||'none'));
	            if(error !== null) {
	                console.log('exec error: '+error);
	            }
	        }
	    );
	}
};
console.log("[Echo Client]");
var fs = require("fs");
var conf = JSON.parse(fs.readFileSync("../conf/jantac.json","utf-8"));
var net = require('net');
var client = new net.Socket();
client.connect(conf["echoPort"], conf["serverAdderess"], function() {
	console.log(" -> Connect successfully.");
	console.log(' -> '+conf["serverAddress"]+":"+conf["echoPort"]);
	console.log("[Start Browser]");
	var exec = require('child_process').exec;
	return exec(conf["browser"] + "http://" + conf["serverAdderess"]+"/client.html", {timeout: 1000},
		function(error, stdout, stderr) {
			console.log('stdout: '+(stdout||'none'));
			console.log('stderr: '+(stderr||'none'));
			if(error !== null) {
				console.log('exec error: '+error);
			}
		}
	);
});
client.on('close', shutdown);
client.on('error', shutdown);
client.on('timeout', shutdown);