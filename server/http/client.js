if(typeof Jantac == 'undefined'){
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

	this.init = function(arguments){
		console.log(JanTac.Conf.url);
		$("head").append($("<meta/>").attr("name","viewport").attr("content","width=device-width, initial-scale=1.0, user-scalable=no"));
		$("body").attr("onContextmenu","return false;");
		$("#borderNorth").touchstart(function(){
			showPanel("north");
		});
		$("#borderEast").touchstart(function(){
			showPanel("east");
		});
		$("#borderSouth").touchstart(function(){
			showPanel("south");
		});
		$("#borderWest").touchstart(function(){
			showPanel("west");
		});
	}

	this.changeRunLevel = function(newLevel){
		var oldLevel = this.RUN_LEVEL;
		switch(oldLevel){
			case this.RL_HALT:
				if(newLevel == this.RL_PIECE){
					this.RUN_LEVEL = newLevel;
					return true;
				}
				break;
			case this.RL_PIECE:
				if(newLevel == this.RL_HALT){
					this.RUN_LEVEL = newLevel;
					return true;
				}else if(newLevel == this.RL_COMPOSITE){
					this.RUN_LEVEL = newLevel;
					return true;
				}
				break;
			case this.RL_COMPOSITE:
				if(newLevel == this.RL_PIECE){
					this.RUN_LEVEL = newLevel;
					return true;
				}
		}
		return false;
	}

	function hidePanel(panel){
		showPanel(panel,false);
	}
	function showPanel(panel){
		var show = (arguments.length > 1)?arguments[1]:true;
		var axis,value;
		console.log(panel+""+show);
		if(show){
			if(panel != "north"){
				hidePanel("north");
			}
			if(panel != "east"){
				hidePanel("east");
			}
			if(panel != "south"){
				hidePanel("south");
			}
			if(panel != "west"){
				hidePanel("west");
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