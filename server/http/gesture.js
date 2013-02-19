<<<<<<< HEAD
if(typeof Jantac == 'undefined'){
	var JanTac = {};
}
JanTac.Gesture = function(target){
	//debugモード？
	this.debug = true;
	//対象domオブジェクト
	this.target = target;
	//コールバック保管場所
	this.callbacks = {};
	//コールバック登録
	this.on = function(eventType,callback,scope){
		this.log("on("+eventType+")");
		if(typeof this.callbacks[eventType] == 'undefined'){
			this.callbacks[eventType] = {};
		}
		var eventID = "e" + this.callbacks[eventType].length;
		this.callbacks[eventType][eventID] = {callback:callback,scope:scope};
		return {eventType:eventType,eventID:eventID};//eventID
	};
	this.off = function(eventID){
		delete this.callbacks[eventID["eventType"]][eventID["eventID"]];
	};
	//イベント発火
	this.fire = function(eventType,e){
		if(typeof this.callbacks[eventType] != 'undefined'){
			this.log("fire("+eventType+")");
			for(var c in this.callbacks[eventType]){
				this.callbacks[eventType][c]["callback"].apply(
					this.callbacks[eventType][c]["scope"],[e]);
			}
		}
	};
	//ジェスチャーイベント設定
	this.gesture = {
		dtapT:1000, //msec (ダブルタップ・ホールドとみなす最大時間)
		dtapD:30 //pixel　(ダブルタップ・ホールドとみなす最大距離)
	};
	//直近イベント履歴
	this.lastTouch = {};
	//ドラッグのパス
	this.dragPath = {};
	//holdタイマー
	this.timerHold = {};
	//位置記録
	this.lastPosition = [];

	//タッチイベントハンドラ
	this.eventTouchstart = function(e){
		//e.changedTouches
		//clientX: クライアント領域（viewport）に対するX座標
		//clientY: クライアント領域（viewport）に対するY座標
		//screenX: 画面の表示領域に対する指のX座標
		//screenY: 画面の表示領域に対する指のX座標
		//pageX: ページ全体に対する指のX座標（スクロールを必要とする領域も含む、ということです）
		//pageY: ページ全体に対する指のX座標
		//target: タッチイベントが発生したノード
		//identifier: それぞれのタッチイベントに対する、ユニークな値
		for(var c = 0; c < e.changedTouches.length; c++){
			//holdタイマー起動
			this.timerHold[e.changedTouches[c].identifier] 
				= this.setTimeout(this.eventHold,this.gesture.dtapT,[{
				clientX:e.changedTouches[c].clientX,
				clientY:e.changedTouches[c].clientY,
				screenX:e.changedTouches[c].screenX,
				screenY:e.changedTouches[c].screenY,
				pageX:e.changedTouches[c].pageX,
				pageY:e.changedTouches[c].pageY
			},e.changedTouches[c].identifier]);
			//新規path作成
			this.dragPath[e.changedTouches[c].identifier] = [{
				identifier:e.changedTouches[c].identifier,
				clientX:e.changedTouches[c].clientX,
				clientY:e.changedTouches[c].clientY,
				screenX:e.changedTouches[c].screenX,
				screenY:e.changedTouches[c].screenY,
				pageX:e.changedTouches[c].pageX,
				pageY:e.changedTouches[c].pageY
			}];
			//イベントを記録
			this.lastTouch[e.changedTouches[c].identifier] = "touchstart";
		}
		this.fire('touchstart',e);
	};
	this.eventTouchend = function(e){
		for(var c = 0; c < e.changedTouches.length; c++){
			//holdタイマー解除
			if(typeof this.timerHold[e.changedTouches[c].identifier] != 'undefined'){
				this.log("clearTimeout(timerHold) : touchend");
				this.clearTimeout(this.timerHold[e.changedTouches[c].identifier]);
				delete this.timerHold[e.changedTouches[c].identifier];
			}
			//tapイベント　or or dtapイベント or dragendイベント発火
			if(this.lastTouch[e.changedTouches[c].identifier] == "drag"){
				//直近のイベントがdragならdragend
				//pathへpointの追加
				this.dragPath[e.changedTouches[c].identifier].push({
					identifier:e.changedTouches[c].identifier,
					clientX:e.changedTouches[c].clientX,
					clientY:e.changedTouches[c].clientY,
					screenX:e.changedTouches[c].screenX,
					screenY:e.changedTouches[c].screenY,
					pageX:e.changedTouches[c].pageX,
					pageY:e.changedTouches[c].pageY
				});
				this.fire("dragend",this.dragPath[e.changedTouches[c].identifier]);
			}else if(this.searchNear(e.changedTouches[c].clientX,e.changedTouches[c].clientY)){
				//位置記録から近い場所へのタップを発見したらdtap
				this.fire("dtap",{
					clientX:e.changedTouches[c].clientX,
					clientY:e.changedTouches[c].clientY,
					screenX:e.changedTouches[c].screenX,
					screenY:e.changedTouches[c].screenY,
					pageX:e.changedTouches[c].pageX,
					pageY:e.changedTouches[c].pageY
				});
			}else{
				//それ以外はtap
				this.fire("tap",{
					clientX:e.changedTouches[c].clientX,
					clientY:e.changedTouches[c].clientY,
					screenX:e.changedTouches[c].screenX,
					screenY:e.changedTouches[c].screenY,
					pageX:e.changedTouches[c].pageX,
					pageY:e.changedTouches[c].pageY
				});
				//位置記録削除タイマー起動
				var id = this.lastPosition.length;
				var t = this.setTimeout(function(id){
					this.fire("tapLazy",this.lastPosition[id].position);
					this.lastPosition[id].valid = false;
					for(var c = 0; c < this.lastPosition.length; c++){
						if(this.lastPosition[c].valid){
							return;
						}
					}
					this.lastPosition = [];
				},this.gesture.dtapT,[id]);
				//位置を記録(dtapのため)
				this.lastPosition.push({
					position:{
						clientX:e.changedTouches[c].clientX,
						clientY:e.changedTouches[c].clientY,
						screenX:e.changedTouches[c].screenX,
						screenY:e.changedTouches[c].screenY,
						pageX:e.changedTouches[c].pageX,
						pageY:e.changedTouches[c].pageY
					},
					timerID:t,
					valid:true
				});
				
			}
			//path削除
			delete this.dragPath[e.changedTouches[c].identifier];
			//イベント記録を削除
			delete this.lastTouch[e.changedTouches[c].identifier];
		}
		this.fire('touchend',e);
	};
	this.eventTouchmove = function(e){
		for(var c = 0; c < e.changedTouches.length; c++){
			//pathへpointの追加
			this.dragPath[e.changedTouches[c].identifier].push({
				identifier:e.changedTouches[c].identifier,
				clientX:e.changedTouches[c].clientX,
				clientY:e.changedTouches[c].clientY,
				screenX:e.changedTouches[c].screenX,
				screenY:e.changedTouches[c].screenY,
				pageX:e.changedTouches[c].pageX,
				pageY:e.changedTouches[c].pageY
			});
			//dtapD以上離れたらholdタイマー解除
			if(typeof this.timerHold[e.changedTouches[c].identifier] != 'undefined'){
				if(
					Math.sqrt(
						Math.pow(this.dragPath[e.changedTouches[c].identifier][0].clientX - this.dragPath[e.changedTouches[c].identifier][this.dragPath[e.changedTouches[c].identifier].length-1].clientX,2) 
						+ Math.pow(this.dragPath[e.changedTouches[c].identifier][0].clientY - this.dragPath[e.changedTouches[c].identifier][this.dragPath[e.changedTouches[c].identifier].length-1].clientY,2)
					) > this.gesture.dtapD
				){
					this.log("clearTimeout(timerHold) : distance");
					this.clearTimeout(this.timerHold[e.changedTouches[c].identifier]);
					this.fire("dragstart",this.dragPath[e.changedTouches[c].identifier]);
					this.lastTouch[e.changedTouches[c].identifier] = "drag";
					delete this.timerHold[e.changedTouches[c].identifier];
				}
			}else{
				//dragmoveイベント発火(初回はdragstartイベント)
				if(this.lastTouch[e.changedTouches[c].identifier] != "drag"){
					this.lastTouch[e.changedTouches[c].identifier] = "drag";
					this.fire("dragstart",this.dragPath[e.changedTouches[c].identifier]);
				}else{
					this.fire("dragmove",this.dragPath[e.changedTouches[c].identifier]);
				}
			}
		}
		this.fire('touchmove',e);
	};
	this.eventTouchcancel = function(e){
		for(var c = 0; c < e.changedTouches.length; c++){
			//全タイマー解除
			//holdタイマー解除
			if(typeof this.timerHold[e.changedTouches[c].identifier] != 'undefined'){
				this.log("clearTimeout(timerHold) : cancel");
				this.clearTimeout(this.timerHold[e.changedTouches[c].identifier]);
				delete this.timerHold[e.changedTouches[c].identifier];
			}
			//path削除

			//位置記録削除

			//lastTouch削除

		}
	};
	this.eventHold = function(position,id){
		this.fire('hold',position);
	};
	//ユーティリティ=======================================================================================
	//thisスコープでタイマーの起動
	this.setTimeout = function(func,time,arge){
		return (function(that,func,time,arge){
			return window.setTimeout(function(){
				func.apply(that,arge);
			},time);
		})(this,func,time,arge);
	};
	//タイマー解除
	this.clearTimeout = function(timerID){
		window.clearTimeout(timerID);
	};
	//thisスコープで動作するイベントハンドラの登録
	this.addEventListener = function(target,eventType,callback){
		(function(that){
			target.addEventListener(eventType,function(e){
				callback.apply(that,[e]);
			});
		})(this,target,eventType,callback);
	}
	//debugメッセージ出力
	this.log = function(msg){
		if(this.debug){
			console.log(msg);
		}
	};
	//近接タップの検索
	this.searchNear = function(x,y){
		for(var c = 0; c < this.lastPosition.length; c++){
			var X = this.lastPosition[c].position.clientX;
			var Y = this.lastPosition[c].position.clientY;
			if(this.lastPosition[c].valid && Math.sqrt(Math.pow(X-x,2)+Math.pow(Y-y,2)) < this.gesture.dtapD){
				//位置記録削除・タイマー削除
				this.lastPosition[c].valid = false;
				this.clearTimeout(this.lastPosition[c].timerID);
				return true;
			}
		}
		return false;
	};
	//targetに対してイベントハンドラを登録
	this.addEventListener(this.target,"touchstart",this.eventTouchstart);
	this.addEventListener(this.target,"touchend",this.eventTouchend);
	this.addEventListener(this.target,"touchmove",this.eventTouchmove);
	this.addEventListener(this.target,"touchcancel",this.eventTouchcancel);
	this.addEventListener(this.target,"touchmove",function(event) {
		event.preventDefault();
	});
};

=======
if(typeof Jantac == 'undefined'){
	var JanTac = {};
}
JanTac.Gesture = function(target){
	//debugモード？
	this.debug = true;
	//対象domオブジェクト
	this.target = target;
	//コールバック保管場所
	this.callbacks = {};
	//コールバック登録
	this.on = function(eventType,callback,scope){
		this.log("on("+eventType+")");
		if(typeof this.callbacks[eventType] == 'undefined'){
			this.callbacks[eventType] = {};
		}
		var eventID = "e" + this.callbacks[eventType].length;
		this.callbacks[eventType][eventID] = {callback:callback,scope:scope};
		return {eventType:eventType,eventID:eventID};//eventID
	};
	this.off = function(eventID){
		delete this.callbacks[eventID["eventType"]][eventID["eventID"]];
	};
	//イベント発火
	this.fire = function(eventType,e){
		if(typeof this.callbacks[eventType] != 'undefined'){
			this.log("fire("+eventType+")");
			for(var c in this.callbacks[eventType]){
				this.callbacks[eventType][c]["callback"].apply(
					this.callbacks[eventType][c]["scope"],[e]);
			}
		}
	};
	//ジェスチャーイベント設定
	this.gesture = {
		dtapT:1000, //msec (ダブルタップ・ホールドとみなす最大時間)
		dtapD:30 //pixel　(ダブルタップ・ホールドとみなす最大距離)
	};
	//直近イベント履歴
	this.lastTouch = {};
	//ドラッグのパス
	this.dragPath = {};
	//holdタイマー
	this.timerHold = {};
	//位置記録
	this.lastPosition = [];

	//タッチイベントハンドラ
	this.eventTouchstart = function(e){
		//e.changedTouches
		//clientX: クライアント領域（viewport）に対するX座標
		//clientY: クライアント領域（viewport）に対するY座標
		//screenX: 画面の表示領域に対する指のX座標
		//screenY: 画面の表示領域に対する指のX座標
		//pageX: ページ全体に対する指のX座標（スクロールを必要とする領域も含む、ということです）
		//pageY: ページ全体に対する指のX座標
		//target: タッチイベントが発生したノード
		//identifier: それぞれのタッチイベントに対する、ユニークな値
		for(var c = 0; c < e.changedTouches.length; c++){
			//holdタイマー起動
			this.timerHold[e.changedTouches[c].identifier] 
				= this.setTimeout(this.eventHold,this.gesture.dtapT,[{
				clientX:e.changedTouches[c].clientX,
				clientY:e.changedTouches[c].clientY,
				screenX:e.changedTouches[c].screenX,
				screenY:e.changedTouches[c].screenY,
				pageX:e.changedTouches[c].pageX,
				pageY:e.changedTouches[c].pageY
			},e.changedTouches[c].identifier]);
			//新規path作成
			this.dragPath[e.changedTouches[c].identifier] = [{
				identifier:e.changedTouches[c].identifier,
				clientX:e.changedTouches[c].clientX,
				clientY:e.changedTouches[c].clientY,
				screenX:e.changedTouches[c].screenX,
				screenY:e.changedTouches[c].screenY,
				pageX:e.changedTouches[c].pageX,
				pageY:e.changedTouches[c].pageY
			}];
			//イベントを記録
			this.lastTouch[e.changedTouches[c].identifier] = "touchstart";
		}
		this.fire('touchstart',e);
	};
	this.eventTouchend = function(e){
		for(var c = 0; c < e.changedTouches.length; c++){
			//holdタイマー解除
			if(typeof this.timerHold[e.changedTouches[c].identifier] != 'undefined'){
				this.log("clearTimeout(timerHold) : touchend");
				this.clearTimeout(this.timerHold[e.changedTouches[c].identifier]);
				delete this.timerHold[e.changedTouches[c].identifier];
			}
			//tapイベント　or or dtapイベント or dragendイベント発火
			if(this.lastTouch[e.changedTouches[c].identifier] == "drag"){
				//直近のイベントがdragならdragend
				//pathへpointの追加
				this.dragPath[e.changedTouches[c].identifier].push({
					identifier:e.changedTouches[c].identifier,
					clientX:e.changedTouches[c].clientX,
					clientY:e.changedTouches[c].clientY,
					screenX:e.changedTouches[c].screenX,
					screenY:e.changedTouches[c].screenY,
					pageX:e.changedTouches[c].pageX,
					pageY:e.changedTouches[c].pageY
				});
				this.fire("dragend",this.dragPath[e.changedTouches[c].identifier]);
			}else if(this.searchNear(e.changedTouches[c].clientX,e.changedTouches[c].clientY)){
				//位置記録から近い場所へのタップを発見したらdtap
				this.fire("dtap",{
					clientX:e.changedTouches[c].clientX,
					clientY:e.changedTouches[c].clientY,
					screenX:e.changedTouches[c].screenX,
					screenY:e.changedTouches[c].screenY,
					pageX:e.changedTouches[c].pageX,
					pageY:e.changedTouches[c].pageY
				});
			}else{
				//それ以外はtap
				this.fire("tap",{
					clientX:e.changedTouches[c].clientX,
					clientY:e.changedTouches[c].clientY,
					screenX:e.changedTouches[c].screenX,
					screenY:e.changedTouches[c].screenY,
					pageX:e.changedTouches[c].pageX,
					pageY:e.changedTouches[c].pageY
				});
				//位置記録削除タイマー起動
				var id = this.lastPosition.length;
				var t = this.setTimeout(function(id){
					this.fire("tapLazy",this.lastPosition[id].position);
					this.lastPosition[id].valid = false;
					for(var c = 0; c < this.lastPosition.length; c++){
						if(this.lastPosition[c].valid){
							return;
						}
					}
					this.lastPosition = [];
				},this.gesture.dtapT,[id]);
				//位置を記録(dtapのため)
				this.lastPosition.push({
					position:{
						clientX:e.changedTouches[c].clientX,
						clientY:e.changedTouches[c].clientY,
						screenX:e.changedTouches[c].screenX,
						screenY:e.changedTouches[c].screenY,
						pageX:e.changedTouches[c].pageX,
						pageY:e.changedTouches[c].pageY
					},
					timerID:t,
					valid:true
				});
				
			}
			//path削除
			delete this.dragPath[e.changedTouches[c].identifier];
			//イベント記録を削除
			delete this.lastTouch[e.changedTouches[c].identifier];
		}
		this.fire('touchend',e);
	};
	this.eventTouchmove = function(e){
		for(var c = 0; c < e.changedTouches.length; c++){
			//pathへpointの追加
			this.dragPath[e.changedTouches[c].identifier].push({
				identifier:e.changedTouches[c].identifier,
				clientX:e.changedTouches[c].clientX,
				clientY:e.changedTouches[c].clientY,
				screenX:e.changedTouches[c].screenX,
				screenY:e.changedTouches[c].screenY,
				pageX:e.changedTouches[c].pageX,
				pageY:e.changedTouches[c].pageY
			});
			//dtapD以上離れたらholdタイマー解除
			if(typeof this.timerHold[e.changedTouches[c].identifier] != 'undefined'){
				if(
					Math.sqrt(
						Math.pow(this.dragPath[e.changedTouches[c].identifier][0].clientX - this.dragPath[e.changedTouches[c].identifier][this.dragPath[e.changedTouches[c].identifier].length-1].clientX,2) 
						+ Math.pow(this.dragPath[e.changedTouches[c].identifier][0].clientY - this.dragPath[e.changedTouches[c].identifier][this.dragPath[e.changedTouches[c].identifier].length-1].clientY,2)
					) > this.gesture.dtapD
				){
					this.log("clearTimeout(timerHold) : distance");
					this.clearTimeout(this.timerHold[e.changedTouches[c].identifier]);
					this.fire("dragstart",this.dragPath[e.changedTouches[c].identifier]);
					this.lastTouch[e.changedTouches[c].identifier] = "drag";
					delete this.timerHold[e.changedTouches[c].identifier];
				}
			}else{
				//dragmoveイベント発火(初回はdragstartイベント)
				if(this.lastTouch[e.changedTouches[c].identifier] != "drag"){
					this.lastTouch[e.changedTouches[c].identifier] = "drag";
					this.fire("dragstart",this.dragPath[e.changedTouches[c].identifier]);
				}else{
					this.fire("dragmove",this.dragPath[e.changedTouches[c].identifier]);
				}
			}
		}
		this.fire('touchmove',e);
	};
	this.eventTouchcancel = function(e){
		for(var c = 0; c < e.changedTouches.length; c++){
			//全タイマー解除
			//holdタイマー解除
			if(typeof this.timerHold[e.changedTouches[c].identifier] != 'undefined'){
				this.log("clearTimeout(timerHold) : cancel");
				this.clearTimeout(this.timerHold[e.changedTouches[c].identifier]);
				delete this.timerHold[e.changedTouches[c].identifier];
			}
			//path削除

			//位置記録削除

			//lastTouch削除

		}
	};
	this.eventHold = function(position,id){
		this.fire('hold',position);
	};
	//ユーティリティ=======================================================================================
	//thisスコープでタイマーの起動
	this.setTimeout = function(func,time,arge){
		return (function(that,func,time,arge){
			return window.setTimeout(function(){
				func.apply(that,arge);
			},time);
		})(this,func,time,arge);
	};
	//タイマー解除
	this.clearTimeout = function(timerID){
		window.clearTimeout(timerID);
	};
	//thisスコープで動作するイベントハンドラの登録
	this.addEventListener = function(target,eventType,callback){
		(function(that){
			target.addEventListener(eventType,function(e){
				callback.apply(that,[e]);
			});
		})(this,target,eventType,callback);
	}
	//debugメッセージ出力
	this.log = function(msg){
		if(this.debug){
			console.log(msg);
		}
	};
	//近接タップの検索
	this.searchNear = function(x,y){
		for(var c = 0; c < this.lastPosition.length; c++){
			var X = this.lastPosition[c].position.clientX;
			var Y = this.lastPosition[c].position.clientY;
			if(this.lastPosition[c].valid && Math.sqrt(Math.pow(X-x,2)+Math.pow(Y-y,2)) < this.gesture.dtapD){
				//位置記録削除・タイマー削除
				this.lastPosition[c].valid = false;
				this.clearTimeout(this.lastPosition[c].timerID);
				return true;
			}
		}
		return false;
	};
	//targetに対してイベントハンドラを登録
	this.addEventListener(this.target,"touchstart",this.eventTouchstart);
	this.addEventListener(this.target,"touchend",this.eventTouchend);
	this.addEventListener(this.target,"touchmove",this.eventTouchmove);
	this.addEventListener(this.target,"touchcancel",this.eventTouchcancel);
	this.addEventListener(this.target,"touchmove",function(event) {
		event.preventDefault();
	});
};

>>>>>>> base version
