function startWebSocket(conf){
	var WebSocketServer = require('websocket').server;
	var http = require('http');
	var DisplayStack = require(__dirname+require('path').sep+'jantac-display.js');

	var RL_HALT = 0;
	var RL_PIECE = 1;
	var RL_TURNUP = 2;

	var NORTH = 0;
	var WEST  = 1;
	var SOUTH = 2;
	var EAST  = 3;

	var server = http.createServer(function(request, response) {
		console.log((new Date()) + ' Received request for ' + request.url);
		response.writeHead(404);
		response.end();
	});
	server.listen(conf["wsPort"], function() {
		console.log((new Date()) + ' Server is listening on port ' + conf["wsPort"]);
	});
	wsServer = new WebSocketServer({
		httpServer: server,
	});

	function originIsAllowed(origin) {
		// put logic here to detect whether the specified origin is allowed.
		console.log("\tORIGIN:"+origin);
		return true;
	}
	var connections = {};
	var channels = {};
	var turnupQue = {};
	var connectionIDCounter = 0;
	var displayStacks = {};
	
	wsServer.on('request', function(request) {
		var channel = request.resource;
		if(typeof channels[channel] == 'undefined'){
			channels[channel] = [];
			turnupQue[channel] = null;
			displayStacks[channel] = new DisplayStack.JanTacDisplayStack();

		}
		if (!originIsAllowed(request.origin)) {
			// Make sure we only accept requests from an allowed origin
			request.reject();
			console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
			return;
		}
		var connection = request.accept(null, request.origin);
		connection.id = connectionIDCounter ++;
		sendMessageMe("welcome",{
			id:connection.id,
		});
		connection.channel = channel;
		connection.channelID = channels[channel].length;
    	connections[connection.id] = connection;
    	channels[channel].push(connection.id);
		console.log((new Date()) + ' Connection accepted.');
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				console.log('Received Message: ' + message.utf8Data);
				var envelope = JSON.parse(message.utf8Data);
				commander(envelope);
				//sendUTFAll(message.utf8Data);
			}else if (message.type === 'binary') {
				console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
				sendBytesAll(message.binaryData);
			}
		});
		connection.on('close', function(reasonCode, description) {
			console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
			for(var c = 0; c < channels[channel]; c++){
				if(channels[channel][c] == connection.id){
					channels[channel] = channels[channel].splice(c, 1); 
					break;
				}
	        }
			if(channels[channel].length == 0){
				delete channels[channel];
				delete turnupQue[channel];
				delete displayStacks[channel];
			}
			delete connections[connection.id];
		});
		function sendUTFAll(msg){
			channels[channel].forEach(function(key){
				connections[key].sendUTF(msg);
	        });
		}
		function sendBytesAll(msg){
			channels[channel].forEach(function(key){
				connections[key].sendBytes(msg);
	        });
		}
		function sendMessageALL(command,message){
			sendUTFAll(JSON.stringify({
				"command":command,
				"message":message
			}));
		}
		function sendMessageMe(command,message){
			connection.sendUTF(JSON.stringify({
				"command":command,
				"message":message
			}));
		}
		function commander(envelope){
			if(typeof envelope == "object" && typeof envelope["command"] != "undefined"){
				var command = envelope["command"];
				var message = envelope["message"];
				switch(command){
					case "pack":
						console.log(JSON.stringify(displayStacks[channel].pack()));
						break;
					case "turnup-in":
						if(turnupQue[channel] != null){
							//link
							
							var parentID = turnupQue[channel].id;
							var parentX = turnupQue[channel].X;
							var parentY = turnupQue[channel].Y;
							var parentWidth = turnupQue[channel].width;
							var parentHeight = turnupQue[channel].height;
							var speedX = turnupQue[channel].speedX;
							var speedY = turnupQue[channel].speedY;
							var childID = message.id;
							var childX  = message.X;
							var childY  = message.Y;
							var childWidth = message.width;
							var childHeight = message.height;
							var outTime = turnupQue[channel].time;
							var inTime = +new Date();
							var outD = turnupQue[channel].out;
							var inD = message.in;
							console.log("turnup:\tlink!");
							var goalX = Math.round(parentX + speedX * (inTime - outTime));
							var goalY = Math.round(parentY + speedY * (inTime - outTime));
							var rotate = ((outD+inD)%4);
							var rotateX = childX;
							var rotateY = childY;
							displayStacks[channel].createDisplay(parentID,parentWidth,parentHeight);
							console.log("#####################rotate="+rotate);
							displayStacks[channel].createDisplay(childID,childWidth,childHeight);
							switch(rotate){
								case 1:
									rotateY = childWidth -childX;
									rotateX = childY;
									break;
								case 2:
									rotateX = childWidth - childX;
									rotateY = childHeight - childY;
									break;
								case 3:
									rotateX = childWidth -childX;
									rotateY = childX;
									break;
							}
							var anchor = {
								parent:{
									headding:0,
									X:goalX,
									Y:goalY
								},
								child:{
									headding:rotate,
									X:childX,
									Y:childY

								}
							}
							sendMessageALL("link",anchor);
							displayStacks[channel].linkDisplay(parentID,childID,anchor);
						}
						break;
					case "turnup-out":
						if(turnupQue[channel] == null){
							message.time = +new Date();
							turnupQue[channel] = message;
							console.log("turnup:\t settimeout!");
							setTimeout(function(){
								turnupQue[channel] = null;
								console.log("turnup:\t deleteQue!");
							}.bind(this),500);
						}
						break
					default:
				}
			}
		}
	});
}

module.exports.startWebSocket = startWebSocket;