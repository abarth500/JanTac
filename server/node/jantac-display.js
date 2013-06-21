function JanTacDisplayStack(){
	this.aaa = "test";
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
		if(arguments.length == 0){
			p={
				rotate:0,
				X:0,
				Y:0,
				width:this.width,
				height:this.height
			};
		}else{
			var rotate = (parentHeadding + anchor.child.headding) % 4;
			var dX = anchor.child.X;
			var dY = anchor.child.Y;
			switch(rotate){
				case 1:
					dY = anchor.child.X;
					dX = this.height - anchor.child.Y;
					break;
				case 2:
					dY = this.height - anchor.child.Y;
					dX = this.width - anchor.child.X;
					break;
				case 3:
					dY = this.width - anchor.child.X
					dX = anchor.child.Y;
					break;
			}
			p={
				rotate:rotate,
				X:anchor.parent.X - dX,
				Y:anchor.parent.Y - dY,
				width:(rotate%2==0)?this.width:this.height,
				height:(rotate%2==0)?this.height:this.width
			};
		}
		p["childlen"]=[];
		this.childlen.forEach(function(my){
			p.childlen.push(my.child.packDisplays(my.anchor));
		});
		return p;
	}
}

module.exports.JanTacDisplayStack = JanTacDisplayStack;
//module.exports.JanTacDisplay = JanTacDisplay;