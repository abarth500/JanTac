if(typeof JanTac == 'undefined'){
	var JanTac = {};
}
JanTac.Manager = function(){

	this.RL_HALT = 0;
	this.RL_PIECE = 1;
	this.RL_TURNUP = 2;

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
	this.turnup = null;
	this.id=null;

	this.init = function(arguments){
		$("head").append($("<meta/>").attr("name","viewport").attr("content","width=device-width, initial-scale=1.0, user-scalable=no"));
		$("body").attr("onContextmenu","return false;");
		this.turnup = new JanTac.Gesture($("#panelCover").get(0));
		this.turnup.on("dtap",$.proxy(function(){
			console.log("pack!");
			this.sendMessage("pack",{});
		},this));
		this.turnup.on("dragend",function(dragPath){
			var width = $(window).width();
			var height = $(window).height();
			var X = dragPath[dragPath.length-1].pageX;
			var Y = dragPath[dragPath.length-1].pageY;
			var pX= dragPath[dragPath.length-10].pageX;
			var pY= dragPath[dragPath.length-10].pageY;
			var time = dragPath[dragPath.length-1].time - dragPath[dragPath.length-10].time;
			var msg = {out : null};
			msg.id = this.id;
			msg.speedX = (X-pX)/time;
			msg.speedY = (Y-pY)/time;
			msg.X = X;
			msg.Y = Y;
			if(X < 10){
				msg.out = this.WEST;
				//msg.X = 0;
				//msg.Y = Math.round(pY - (pX-0)*Math.tan(Math.atan2(pY-Y,pX-X)));
			}else if(X > $("#panelCover").innerWidth() - 10){
				msg.out = this.EAST;
				//msg.X = widht;
				//msg.Y = Math.round(pY - (pX-width)*Math.tan(Math.atan2(pY-Y,pX-X)));
			}else if(Y < 10){
				msg.out = this.NORTH;
				//msg.X = Math.round(pX - (pY-0)*Math.tan(Math.atan2(pX-X,pY-Y)));
				//msg.Y = 0;
			}else if(Y > $("#panelCover").innerHeight() - 10){
				msg.out = this.SOUTH;
				//msg.X = Math.round(pX - (pY-height)*Math.tan(Math.atan2(pX-X,pY-Y)));
				//msg.Y = height;
			}
			if(msg.out != null){
				msg.width = width;
				msg.height=height;
				console.log("turnup-out:\t"+JSON.stringify(msg));
				//this.ws.send(msg);
				this.sendMessage("turnup-out",msg);
			}
		},this);
		this.turnup.on("dragstart",function(dragPath){
			var msg = {
				id : this.id,
				X : dragPath[dragPath.length-1].pageX,
				Y : dragPath[dragPath.length-1].pageY,
				width : $(window).width(),
				height:  $(window).height()
			};

			msg.in = null;
			if(msg.X < 50){
				msg.in = this.WEST;
			}else if(msg.X > $("#panelCover").innerWidth() - 50){
				msg.in = this.EAST;
			}else if(msg.Y < 50){
				msg.in = this.NORTH;
			}else if(msg.Y > $("#panelCover").innerHeight() - 50){
				msg.in = this.SOUTH;
			}console.log("turnup-in:\t"+JSON.stringify(msg));
			if(msg.in != null){
				
				//this.ws.send(msg);
				this.sendMessage("turnup-in",msg);
			}
		},this);
		console.log("WebSocket Connect");
		var url = "ws://192.168.111.111:40001/";/*for debug*/
		if(typeof JanTac.Conf != "undefined"){
			url = JanTac.Conf.url;
		}
		console.log("\tto: "+url);
		this.ws = new WebSocket(url,"JanTacMessaging");
		this.ws.onopen = $.proxy(function() {
			console.log("WebSocket Open");
			//this.sendMessage("hello",{"message":"hello"});
			this.ws.onmessage = $.proxy(function(msg) {
				console.log("WebSocket Message");
				console.log(msg.data); // test
				var envelope = JSON.parse(msg.data);
				var command = envelope["command"];
				var message = envelope["message"];
				switch(command){
					case "welcome":
						this.id = message["id"];
						this.changeRunLevel(this.RL_PIECE);
						break;
					case "link":
						if(message["child"]["id"]==this.id){
							//この画面が子リンクの場合
							if(message["child"]["rotate"]!=0){
							/*	if(message["child"]["rotate"]%2==1){
									$('#panelCover').width($('#panelCover').height());
									$('#panelCover').height($('#panelCover').width());
								}
								$('#panelCover').rotate({
									angle: 90*message["child"]["rotate"]
								});
							*/
							}
						}
						break;
				}
  			},this);
		},this);
		this.ws.onclose = function(evt) { console.log("\tClose:"+JSON.stringify(evt));};  
		this.ws.onerror = function(evt) { console.log("\tERROR:"+JSON.stringify(evt)); };
	}
	this.writePieceMenu = function(menu){
		$("#panelNorth").html("");
		$("#panelEast").html("");
		$("#panelSouth").html("");
		$("#panelWest").html("");
		var icon = $("<img/>").attr("src","image/iconFallIn.png");
		icon.on("click",$.proxy(function(){
			this.changeRunLevel(this.RL_TURNUP);
		},this));
		$("#panelNorth").append(icon.clone(true));
		$("#panelEast").append(icon.clone(true));
		$("#panelSouth").append(icon.clone(true));
		$("#panelWest").append(icon);
	}
	this.setBehavior = function(runLevel){
		this.clearBehavior();
		switch(runLevel){
			case this.RL_HALT:
				break;
			case this.RL_PIECE:
				this.writePieceMenu();
				$("#borderNorth").on('touchstart',$.proxy(function(){
					this.showPanel("north");
				},this));
				$("#borderEast").on('touchstart',$.proxy(function(){
					this.showPanel("east");
				},this));
				$("#borderSouth").on('touchstart',$.proxy(function(){
					this.showPanel("south");
				},this));
				$("#borderWest").on('touchstart',$.proxy(function(){
					this.showPanel("west");
				},this));
				break;
			case this.RL_TURNUP:
				this.hideAllPanel();
				$('#panelCover').show();
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
		console.log("changeRunLevel:\t"+oldLevel+" --> "+newLevel);
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
				}else if(newLevel == this.RL_TURNUP){
					this.setBehavior(newLevel);
					this.RUN_LEVEL = newLevel;
					return true;
				}
				break;
			case this.RL_TURNUP:
				if(newLevel == this.RL_PIECE){
					this.setBehavior(newLevel);
					this.RUN_LEVEL = newLevel;
					return true;
				}
		}
		console.log("[changeRunLevel] Illigal run level change:"+oldLevel+" to "+newLevel);
		return false;
	}
	this.hideAllPanel = function(){
		this.hidePanel("north");
		this.hidePanel("east");
		this.hidePanel("south");
		this.hidePanel("west");
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
				value = show?$("#panelNorth").innerHeight():0;
				break;
			case "east":
				panel = "#panelEast";
				axis = "marginLeft";
				value = show?(-1*$("#panelEast").innerWidth()):0;
				break;
			case "south":
				panel = "#panelSouth";
				axis = "marginTop";
				value = show?(-1*$("#panelSouth").innerHeight()):0;
				break;
			case "west":
				panel = "#panelWest";
				axis = "marginLeft";
				value = show?$("#panelWest").innerWidth():0;
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
	this.sendMessage = function(command,message){
		var envelope = {
			"command":command,
			"message":message
		};
		this.ws.send(JSON.stringify(envelope));
	}

	this.init(arguments);
}