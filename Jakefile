var sep = require('path').sep;
var cd = (require('os').platform().indexOf('win') > -1)?'cd /d ':'cd ';
var dirBuild = "build";
var dirServer = "server";
var dirClient = "client";
var modules = {
	"server":['websocket','wake_on_lan'],
	"client":['websocket']
};

desc('Installation guides of JanTac');
task('default', function (params) {
	console.log('JanTac (Shohei Yokoyama)');
	console.log('See following page!');
	console.log('\thttp://lab.yokoyama.ac/Research/JanTac');
});

namespace("server",function(){
	desc('Configure JanTac server module');
	task('configure', function () {
		var ERROR = [];		
		var conf = JSON.parse(require("fs").readFileSync("server"+sep+"conf"+sep+"jantac.json","utf-8"));
		if(typeof process.env.WOL != 'undefined'){
			conf["WOL"] = (process.env.WOL=="true")?true:false;
			if(conf["WOL"]){
				if(typeof process.env.broadcastAddress == 'undefined'){
					ERROR.push("argument broadcastAddress is missing.");
				}else{
					conf["broadcastAddress"] = process.env.broadcastAddress;
				}
				if(typeof process.env.macAddresses == 'undefined'){
					ERROR.push("argument macAddresses is missing.");
				}else{
					conf["macAddresses"] = process.env.macAddresses.split(",");
				}
			}
		}
		if(typeof process.env.administrator != 'undefined'){
			conf["administrator"] = process.env.administrator;
		}
		if(typeof process.env.system != 'undefined'){
			conf["system"] = process.env.system;
		}
		if(typeof process.env.path != 'undefined'){
			conf["path"] = typeof process.env.path;
		}
		if(conf["path"]==""){
				conf["path"] = process.env.HOME + "/jantac-server";
		}
		if(ERROR.length>0){
			console.error("[ERROR]\n\t" + ERROR.join("\n\t")+"\n");
			return false;
		}
		jake.Task['clean'].invoke();
		console.log("Configuration!");
		jake.mkdirP(dirBuild);
		jake.cpR("server"+sep,dirBuild+sep);
		var fs = require('fs');
		fs.writeFileSync(dirBuild+sep+"server"+sep+"conf"+sep+"jantac.json",JSON.stringify(conf));
		console.log('--->Finish!!!');
	});
	desc('Installing JanTac server module');
	task('install',function(){
		console.log('Install JanTac Server');
		var dirSource = 'server';
		var fs = require('fs');
		var conf = JSON.parse(fs.readFileSync(dirBuild+sep+"server"+sep+"conf"+sep+"jantac.json","utf-8"));
		if(fs.existsSync(dirBuild)){
			console.log('*New configuration is exist.');
			console.log('*Update all files INCLUDES your configuration');
			dirSource = dirBuild + sep + dirSource;
		}else{
			if(!fs.existsSync(conf["path"] + sep + 'conf')){
				console.error("[ERROR]: Configuration first!");
				return false;
			}
			console.log('*Update all files EXCEPT your configuration');
		}
		
		var confhtml = {};
		confhtml["url"] = conf["protcol"] + "://" + conf["serverAddress"] + ":" + conf["wsPort"] + "/";
		var jscode = 'if(typeof JanTac == "undefined"){var JanTac = {};}\n';
		jscode +=    'JanTac.Conf = '+JSON.stringify(confhtml)+';\n';
		fs.writeFileSync(dirSource+sep+"http"+sep+"conf.js",jscode);
		if(!fs.existsSync(conf["path"]) || !fs.statSync(conf["path"]).isDirectory()){
			fs.mkdirSync(conf["path"]);
		}
		var binFiles = jake.readdirR(dirSource+"/bin");
		for(var c in binFiles){
			if(fs.statSync(binFiles[c]).isFile()){
				var contents = fs.readFileSync(binFiles[c],"utf8");
				contents= contents.replace(/\%\%\%PREFIX\%\%\%/g,conf["path"]);
				fs.writeFileSync(binFiles[c],contents);
			}
		}
		var allFiles = jake.readdirR(dirSource);
		for(var c in allFiles){
			if(allFiles[c] == dirSource || 
				(!fs.existsSync(dirBuild) && allFiles[c] == dirSource + sep + 'conf')){
				continue;
			}
			var stats = fs.statSync(allFiles[c]);
			if(stats.isDirectory()){
				jake.cpR(allFiles[c],conf["path"]);
			}
		}
		console.log('--->Finish!!!');
		if(fs.existsSync(dirBuild)){
			jake.Task['clean'].invoke();
		}
		jake.Task['server:modules'].invoke(conf["path"]);
	});
	desc('Install/Update required node.js modules');
	task('modules', function (path) {
		var cmds = [];
		for(var c in modules['server']){
			cmds.push('npm install '+modules['server'][c]);
		}
		if(cmds.length>0){
			jake.exec(cmds, function () {
				console.log('All nodejs modules are installed.');
				jake.rmRf(path+sep+'node'+sep+'node_modules');
				jake.cpR('node_modules',path+sep+'node'+sep);
				jake.rmRf('node_modules');
				complete();
			}, {printStdout: true});
		}else{
			jake.mkdirP('node_modules');
			jake.rmRf(path+sep+'node'+sep+'node_modules');
			jake.cpR('node_modules',path+sep+'node'+sep);
			jake.rmRf('node_modules');
		}
	});
});

namespace("client",function(){
	desc('Configure JanTac client module');
	task('configure', function (serverAddress) {
		var ERROR = [];	
		var conf = JSON.parse(require("fs").readFileSync("client"+sep+"conf"+sep+"jantac.json","utf-8"));	
		if(typeof process.env.administrator != 'undefined'){
			conf["administrator"] = process.env.administrator;
		}
		if(typeof process.env.system != 'undefined'){
			conf["system"] = process.env.system;
		}
		if(ERROR.length>0){
			console.error("[ERROR]\n\t" + ERROR.join("\n\t")+"\n");
			return false;
		}
		jake.Task['clean'].invoke();
		console.log("Configuration!");
		jake.mkdirP(dirBuild);
		jake.cpR("client"+sep,dirBuild+sep);
		var fs = require('fs');
		fs.writeFileSync(dirBuild+sep+"client"+sep+"conf"+sep+"jantac.json",JSON.stringify(conf));
		console.log('--->Finish!!!');
	});

	desc('Installing JanTac client module');
	task('install', function () {
		console.log('Install JanTac Client');
		var dirSource = 'client';
		var conf = JSON.parse(require("fs").readFileSync(dirBuild+sep+"client"+sep+"conf"+sep+"jantac.json","utf-8"));
		var fs = require('fs');
		if(fs.existsSync(dirBuild)){
			console.log('*New configuration is exist.');
			console.log('*Update all files INCLUDES your configuration');
			dirSource = dirBuild + sep + dirSource;
		}else{
			if(!fs.existsSync(conf["path"] + sep + 'conf')){
				console.error("[ERROR]: Configuration first!");
				return false;
			}
			console.log('*Update all files EXCEPT your configuration');
		}
		if(!fs.existsSync(conf["path"]) || !fs.statSync(conf["path"]).isDirectory()){
			fs.mkdirSync(conf["path"]);
		}
		var binFiles = jake.readdirR(dirSource+"/bin");
		for(var c in binFiles){
			if(fs.statSync(binFiles[c]).isFile()){
				var contents = fs.readFileSync(binFiles[c],"utf8");
				contents= contents.replace(/\%\%\%PREFIX\%\%\%/g,conf["path"]);
				fs.writeFileSync(binFiles[c],contents);
			}
		}
		var allFiles = jake.readdirR(dirSource);
		for(var c in allFiles){
			if(allFiles[c] == dirSource || 
				(!fs.existsSync(dirBuild) && allFiles[c] == dirSource + sep + 'conf'))
			{
				continue;
			}
			var stats = fs.statSync(allFiles[c]);
			if(stats.isDirectory()){
				jake.cpR(allFiles[c],conf["path"]);
			}
		}
		console.log('--->Finish!!!');
		if(fs.existsSync(dirBuild)){
			jake.Task['clean'].invoke();
		}
		jake.Task['client:modules'].invoke(conf["path"]);
	});
	
	desc('Install/Update required node.js modules');
	task('modules', function (path) {
		var cmds = [];
		for(var c in modules['client']){
			cmds.push('npm install '+modules['client'][c]);
		}
		if(cmds.length>0){
			jake.exec(cmds, function () {
				console.log('All nodejs modules installed.');
				jake.rmRf(path+sep+'node'+sep+'node_modules');
				jake.cpR('node_modules',path+sep+'node'+sep);
				jake.rmRf('node_modules');
				complete();
			}, {printStdout: true});
		}else{
			jake.mkdirP('node_modules');
			jake.rmRf(path+sep+'node'+sep+'node_modules');
			jake.cpR('node_modules',path+sep+'node'+sep);
			jake.rmRf('node_modules');
		}
	});
});

desc('Cleaning JanTac temporally files for installing');
task('clean', function (params) {
	console.log('Start cleaning of build directory');
 	jake.rmRf(dirBuild);
 	console.log('--->Finish!!!');
});
