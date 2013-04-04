if(typeof JanTac == 'undefined'){
	var JanTac = {};
}
JanTac.Manager = function(){

	this.RL_HALT = 0;
	this.RL_PIECE = 1;
	this.RL_COMPOSITE = 2;

	this.NORTH = 0;
	this.WEST  = 1;
	this.SOUTH = 2;
	this.EAST  = 3;

	this.RUN_LEVEL = this.RL_HALT;
	this.HEDDING = this.NORTH;
	this.NEIGHBOUR = [];
	this.NEIGHBOUR[this.NORTH] = 0;
	this.NEIGHBOUR[this.WEST ] = 0;
	this.NEIGHBOUR[this.SOUTH] = 0;
	this.NEIGHBOUR[this.EAST ] = 0;

	this.ws = null;

	this.init = function(arguments){
		$("head").append($("<meta/>").attr("name","viewport").attr("content","width=device-width, initial-scale=1.0, user-scalable=no"));
		$("body").attr("onContextmenu","return false;");
		console.log("WebSocket Connect");
		var url = "ws://192.168.111.111:40001/";/*for debug*/
		if(typeof JanTac.Conf != "undefined"){
			url = JanTac.Conf.url;
		}
		console.log("\tto: "+url);
		this.ws = new WebSocket(url,"JanTacMessaging");
		this.ws.onopen = $.proxy(function() {
			this.setBehavior(this.RL_COMPOSITE);
			console.log("WebSocket Open");
			this.ws.send("test");
			this.ws.onmessage = function(message) {
				console.log("WebSocket Message");
				console.log(message.data); // test
  			};
		},this);
		this.ws.onclose = function(evt) { console.log("\tClose:"+JSON.stringify(evt));};  
		this.ws.onerror = function(evt) { console.log("\tERROR:"+JSON.stringify(evt)); };
	}
	this.setBehavior = function(runLevel){
		this.clearBehavior();
		switch(runLevel){
			case this.RL_HALT:
				break;
			case this.RL_PIECE:
				break;
			case this.RL_COMPOSITE:
				$("#borderNorth").on('touchstart',$.proxy(function(){
					this.showPanel("north");
				}),this);
				$("#borderEast").on('touchstart',$.proxy(function(){
					this,showPanel("east");
				}),this);
				$("#borderSouth").on('touchstart',$.proxy(function(){
					this.showPanel("south");
				}),this);
				$("#borderWest").on('touchstart',$.proxy(function(){
					this.showPanel("west");
				}),this);
				break;
			default:
				console.log("[setBehavior] Illigal run level:"+runLevel);
		}
	}
	this.clearBehavior = function(){
		$("#borderNorth").off();
		$("#borderEast").off();
		$("#borderSouth").off();
		$("#borderWest").off();
	}
	this.changeRunLevel = function(newLevel){
		var oldLevel = this.RUN_LEVEL;
		switch(oldLevel){
			case this.RL_HALT:
				if(newLevel == this.RL_PIECE){
					this.setBehavior(newLevel);
					this.RUN_LEVEL = newLevel;
					return true;
				}
				break;
			case this.RL_PIECE:
				if(newLevel == this.RL_HALT){
					this.setBehavior(newLevel);
					this.RUN_LEVEL = newLevel;
					return true;
				}else if(newLevel == this.RL_COMPOSITE){
					this.setBehavior(newLevel);
					this.RUN_LEVEL = newLevel;
					return true;
				}
				break;
			case this.RL_COMPOSITE:
				if(newLevel == this.RL_PIECE){
					this.setBehavior(newLevel);
					this.RUN_LEVEL = newLevel;
					return true;
				}
		}
		console.log("[changeRunLevel] Illigal run level change:"+this.RUN_LEVEL+" to "+runLevel);
		return false;
	}

	this.hidePanel = function(panel){
		this.showPanel(panel,false);
	}
	this.showPanel = function(panel){
		var show = (arguments.length > 1)?arguments[1]:true;
		var axis,value;
		console.log(panel+""+show);
		if(show){
			if(panel != "north"){
				this.hidePanel("north");
			}
			if(panel != "east"){
				this.hidePanel("east");
			}
			if(panel != "south"){
				this.hidePanel("south");
			}
			if(panel != "west"){
				this.hidePanel("west");
			}
		}
		switch(panel){
			case "north":
				panel = "#panelNorth";
				axis = "marginTop";
				value = show?$("#panelNorth").height():0;
				break;
			case "east":
				panel = "#panelEast";
				axis = "marginLeft";
				value = show?(-1*$("#panelEast").width()):0;
				break;
			case "south":
				panel = "#panelSouth";
				axis = "marginTop";
				value = show?(-1*$("#panelSouth").height()):0;
				break;
			case "west":
				panel = "#panelWest";
				axis = "marginLeft";
				value = show?$("#panelWest").width():0;
				break;
			default:
				return
		}
		console.log(panel+"\t"+axis+"\t"+value);
		var opt = {};
		opt[axis] = value+"px";
		$(panel).animate(opt,{
			duration:700,
			easing:"easeInOutQuint"
		});
	}

	this.init(arguments);
}