function JanTacDisplayStack(){
	this.grandParents = [];
	this.displays = {};
	this.createDisplay=function(id,width,height){
		console.log("createDisplay:"+id+","+width+","+height);
		if(typeof this.displays[id] == "undefined"){
			this.displays[id] = new JanTacDisplay(id,width,height);
		}
	}
	this.getDisplay = function(id){
		return this.displays[id];
	}
	this.linkDisplay = function(parentID,childID,anchor){
		var parent = this.displays[parentID];
		var child  = this.displays[childID];
		this.grandParents.forEach(function(gParent){
			if(gParent.id == child.id){
				return false;
			}
		});
		if(parent.parents.length==0){
			this.grandParents.push(parent);
		}
		parent.addChild(child,anchor);
		return true;
	}
	this.removeDisplay = function(display){

	}
	this.pack = function(){
		var displayCloud = [];
		this.grandParents.forEach(function(gParent){
				displayCloud.push(gParent.packDisplays());
		});
		return displayCloud;
	}
}

function JanTacDisplay(id,width,height){
	console.log("createDisplay::"+id+","+width+","+height);
	this.id = id;
	this.width = width;
	this.height = height;
	this.parents = [];
	this.childlen= [];
	/*
anchor = {
	parent:{
		headding:0～3,
		X:000,
		Y:000	
	},
	child:{
		headding:0～3,
		X:000,
		Y:000
	}

};


	*/
	this.addChild = function(child,anchor){
		this.childlen.push({
			anchor:anchor,
			child:child
		});
		child.addParent(this)
	}
	this.addParent = function(parent){
		this.parents.push(parent);
	}
	this.packDisplays = function(anchor){
		console.log("pack\t"+this.id);
		var p = {};
		var rotate = 0;
		var presetX = 0;
		var presetY = 0;
		if(arguments.length == 0){
			p={
				rotate:rotate,
				id:this.id,
				X:0,
				Y:0,
				width:this.width,
				height:this.height
			};
		}else{
			rotate = (anchor.child.headding + anchor.parent.headding) % 4;
			console.log("var "+rotate+" = ("+anchor.parent.headding+","+anchor.child.headding+")");
			var dX = anchor.child.X;
			var dY = anchor.child.Y;
			switch(rotate){
				case 3:
					dY = anchor.child.X;
					dX = this.height - anchor.child.Y;
					//pY = pX;
					//pX = pY;
					break;
				case 2:
					dY = this.height - anchor.child.Y;
					dX = this.width - anchor.child.X;
					//pY = 
					//pX = 
					break;
				case 1:
					dY = this.width - anchor.child.X;
					dX = anchor.child.Y;
					//pY = this.width - nchor.parent.presetX;
					//pX = anchor.parent.presetY;
					break;
			}
			var pX = anchor.parent.X;
			var pY = anchor.parent.Y;
			switch((anchor.parent.headding) % 4){
				case 3:
					pY = anchor.parent.X;
					pX = anchor.parent.height - anchor.parent.Y;
					break;
				case 2:
					pY = anchor.parent.height - anchor.parent.Y;
					pX = anchor.parent.width - anchor.parent.X;
					break;
				case 1:
					pY = anchor.parent.width - anchor.parent.X;
					pX = anchor.child.Y;
					break;
			}
			presetX = anchor.parent.presetX + pX - dX;
			presetY = anchor.parent.presetY + pY - dY;
			p={
				rotate:rotate,
				id:this.id,
				X:presetX,
				Y:presetY,
				width:(rotate%2==0)?this.width:this.height,
				height:(rotate%2==0)?this.height:this.width
			};
			console.log("===\n"+JSON.stringify(anchor)+"\n===");
		}
		p = [p];
		this.childlen.forEach(function(my){
			my.anchor.parent.headding = rotate;
			my.anchor.parent.presetX = presetX;
			my.anchor.parent.presetY = presetY;
			my.anchor.parent.width = this.width;
			my.anchor.parent.height = this.height;
			p.push(my.child.packDisplays(my.anchor));
		}.bind(this));
		return p;
	}
}

module.exports.JanTacDisplayStack = JanTacDisplayStack;
//module.exports.JanTacDisplay = JanTacDisplay;