var http = require('http');
var mysql = require('mysql');
var util = require('util');
var WebSocketServer = require('websocket').server;

let database = require('./Database');  
let MainDatabase = database.SimpleDatabase;

var SimpleDatabase = new MainDatabase();

var server = http.createServer(function handler(req, res) {
	res.writeHead(404);
	res.end('Hello World\n');
	console.log("HTTP request received");
	});

server.listen(8080,'179.235.137.55', function() {
	    console.log((new Date()) + ' Server is listening on port 8080');
	});

wsServer = new WebSocketServer({
	    httpServer: server,
	    // You should not use autoAcceptConnections for production
	    // applications, as it defeats all standard cross-origin protection
	    // facilities built into the protocol and the browser.  You should
	    // *always* verify the connection's origin and decide whether or not
	    // to accept it.
	    autoAcceptConnections: false
	});

function originIsAllowed(origin) {
	  // put logic here to detect whether the specified origin is allowed.
	  return true;
	}

wsServer.on('request', function(request) {
		
		console.log(request.requestedProtocols);
		
		
	    if (!originIsAllowed(request.origin)) {
	      // Make sure we only accept requests from an allowed origin
	      request.reject();
	      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
	      return;
	    }
	    
	    var connection = request.accept('', request.origin);
	    console.log((new Date()) + ' Connection accepted.');
	    
	    
	    connection.on('message', function(message) {
	        if (message.type === 'utf8') {
	            console.log('Received Message: ' + message.utf8Data);
	            var jsonData = JSON.parse(message.utf8Data);
	            console.log(jsonData['wantedAction']);
	            var wantedAction = jsonData['wantedAction'];
	            wantedActionSQL(wantedAction,jsonData,connection);
	            
	        }
	    });
	    connection.on('close', function(reasonCode, description) {
	        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	    });
	    connection.on('error', function(reasonCode, description) {
	        console.log('Error server');
	    });
	    
	    
	    
	});
function wantedActionSQL(wantedAction, jsonData,connection)
{
	if(wantedAction == 'registerUser')
	{
		SimpleDatabase.registerUser(jsonData['user'],jsonData['pass'],jsonData['mail'],jsonData['keysNumber'], function (results)
		{
			console.log("RegisterUSER result=",results.success," ERROR=",results.error);
			connection.sendUTF(
		            JSON.stringify(
		            		{ success: results.success, 
		            		  error: results.error
		            		}));
		});
	}
	else if(wantedAction == 'signIn')
	{
		SimpleDatabase.signIn(jsonData['user'],jsonData['pass'],jsonData['mail'], function(results)
		{
			console.log("Singin Results Error",results.error, " user=",results.user, " passwrod=",results.pass, " mail =",results.mail, " keysnumber=",results.keysNumber, " money =",results.money, " score",results.score);
			connection.sendUTF(
		            JSON.stringify(
		            		{ success: results.success, 
		            		  error: results.error,
		            		  user:results.user,
							  mail: results.mail,
							  keysNumber:results.keysNumber,
							  money:results.money,
							  score:results.score
		            		  
		            		}));
		});
	}
	else if(wantedAction == 'setChar')
	{
		
		SimpleDatabase.setChar(jsonData['user'],jsonData['keysNumber'],jsonData['gender'],jsonData['charInfo'], function(results)
		{
			console.log("SETCHAR Success=",results.success);
			connection.sendUTF(
		            JSON.stringify(
		            		{ success: results.success, 
		            		  error: results.error
		            		}));
		});
	}
	else if(wantedAction == 'loadChar')
	{
		SimpleDatabase.loadChar(jsonData['user'],jsonData['keysNumber'], function(results)
		{
			console.log("gender=",results.gender," CharInfo=",results.charInfo);
			connection.sendUTF(
		            JSON.stringify(
		            		{ success: results.success, 
		            		  error: results.error,
		            		  charInfo: results.charInfo,
							  gender: results.gender
		            		}));	
		});
	}
	else if(wantedAction == 'setMoneyScore')
	{
		SimpleDatabase.setMoneyScore(jsonData['user'],jsonData['keysNumber'],jsonData['money'],jsonData['score'], function(results)
				{
				console.log("setMoneyScore Success=",results.success);
					connection.sendUTF(
				            JSON.stringify(
				            		{ success: results.success, 
				            		  error: results.error,
				            		}));	
				});
	}
	else if(wantedAction == 'loadOnline')
	{
		SimpleDatabase.loadOnline(jsonData['user'],jsonData['keysNumber'], function(results)
				{
					console.log(" nade = ",results.lemonades," water = ",results.water," tjuice = ",results.juice," sug = ",results.sugar," lemons = ",results.lemons," stashedlemo = ",results.lemonStashed," moneystas = ",results.moneyStashed," custname = ",results.custName," custgender = ",results.custGender," custcombined = ",results.custCombined," custnarc = ",results.custNarc," custnarcperc = ",results.custNarcPerc," custsellprice = ",results.custSellPrice," custtotal = ",results.custTotal," cookername = ",results.cookerName," cookergender = ",results.cookerGender," cookercom = ",results.cookerCombined," cookernarc = ",results.cookerNarc," cookernarcperc = ",results.cookerNarcPerc," cookersalary = ",results.cookerSalary," cookertotal = ",results.cookerTotal," cookamountmade = ",results.cookerAmountMade," cookaddicperc = ",results.cookerAddictPercent," cookeraddict = ",results.cookerAddict," cookerallowcook = ",results.cookerAllowCook," cookerpotent = ",results.cookerPotent," killername = ",results.killerName," killergender = ",results.killerGender," killercomb = ",results.killerCombined," killernarc = ",results.killerNarc," killernarcperc = ",results.killerNarcPerc," killertotal = ",results.killerTotal," sellername = ",results.sellerName," sellergender = ",results.sellerGender," sellercomb = ",results.sellerCombined," sellernarc = ",results.sellerNarc," sellernarcperc = ",results.sellerNarcPerc," sellersellprice = ",results.sellerSellPrice," sellertotal = ",results.sellerTotal," sellercurrentsupply = ",results.sellerCurrentSupply," sellerscamperc = ",results.sellerScamPercent," sellerscam = ",results.sellerScam," sellerpercCut = ",results.sellerPercentCut," online = ",results.online," attacked = ",results.attacked," attackusern = ",results.attackuser," attackeysnum = ",results.attackkeysNumber," attackkillercount = ",results.attackKillerCount," ighandle = ",results.igHandle);
					connection.sendUTF(
				            JSON.stringify(
				            		{ 	success: results.success, 
				            			error: results.error,
				            		  	lemonades : results.lemonades,
										water : results.water,
										juice: results.juice, 
										sugar: results.sugar ,
										lemons : results.lemons ,
										lemonStashed : results.lemonStashed, 
										moneyStashed: results.moneyStashed,
										custName: results.custName ,
										custGender : results.custGender, 
										custCombined : results.custCombined, 
										custNarc : results.custNarc ,
										custNarcPerc : results.custNarcPerc, 
										custSellPrice: results.custSellPrice, 
										custTotal : results.custTotal ,
										cookerName : results.cookerName ,
										cookerGender : results.cookerGender, 
										cookerCombined : results.cookerCombined, 
										cookerNarc : results.cookerNarc ,
										cookerNarcPerc : results.cookerNarcPerc, 
										cookerSalary: results.cookerSalary ,
										cookerTotal : results.cookerTotal ,
										cookerAmountMade : results.cookerAmountMade ,
										cookerAddictPercent : results.cookerAddictPercent, 
										cookerAddict : results.cookerAddict ,
										cookerAllowCook : results.cookerAllowCook, 
										cookerPotent : results.cookerPotent ,
										killerName: results.killerName ,
										killerGender : results.killerGender, 
										killerCombined : results.killerCombined, 
										killerNarc : results.killerNarc ,
										killerNarcPerc : results.killerNarcPerc, 
										killerTotal : results.killerTotal ,
										sellerName : results.sellerName ,
										sellerGender : results.sellerGender, 
										sellerCombined : results.sellerCombined, 
										sellerNarc : results.sellerNarc ,
										sellerNarcPerc : results.sellerNarcPerc, 
										sellerSellPrice : results.sellerSellPrice, 
										sellerTotal : results.sellerTotal ,
										sellerCurrentSupply : results.sellerCurrentSupply, 
										sellerScamPercent : results.sellerScamPercent ,
										sellerScam : results.sellerScam ,
										sellerPercentCut: results.sellerPercentCut, 
										online : results.online ,
										attacked : results.attacked, 
										attackuser : results.attackuser, 
										attackkeysNumber : results.attackkeysNumber, 
										attackKillerCount : results.attackKillerCount, 
										igHandle : results.igHandle
				            		}));	
				});
	}
	else if(wantedAction == 'setOnline')
	{
		SimpleDatabase.setOnline(jsonData['user'],jsonData['keysNumber'],jsonData['lemonades'],jsonData['water'],jsonData['juice'],jsonData['sugar'],jsonData['lemons'],jsonData['lemonadeStashed'],jsonData['moneyStashed'],jsonData['custName'],jsonData['custGender'],jsonData['custCombined'],jsonData['custNarc'],jsonData['custNarcPerc'],jsonData['custSellPrice'],jsonData['custTotal'],jsonData['cookerName'],jsonData['cookerGender'],jsonData['cookerCombined'],jsonData['cookerNarc'],jsonData['cookerNarcPerc'],jsonData['cookerSalary'],jsonData['cookerTotal'],jsonData['cookerAmountMade'],jsonData['cookerAddictPercent'],jsonData['cookerAddict'],jsonData['cookerAllowCook'],jsonData['cookerPotent'],jsonData['killerName'],jsonData['killerGender'],jsonData['killerCombined'],jsonData['killerNarc'],jsonData['killerNarcPerc'],jsonData['killerTotal'],jsonData['sellerName'],jsonData['sellerGender'],jsonData['sellerCombined'],jsonData['sellerNarc'],jsonData['sellerNarcPerc'],jsonData['sellerSellPrice'],jsonData['sellerTotal'],jsonData['sellerCurrentSupply'],jsonData['sellerScamPercent'],jsonData['sellerScam'],jsonData['sellerPercentCut'],jsonData['online'],jsonData['attacked'],jsonData['attackuser'],jsonData['attackkeysNumber'],jsonData['attackKillerCount'],jsonData['ighandle'],function(results)
				{
					console.log("setaONLINE Success=",results.success);
					connection.sendUTF(
				            JSON.stringify(
				            		{ success: results.success, 
				            		  error: results.error
				            		}));	
				});
	}
	else if(wantedAction == 'attackUser')
	{
		SimpleDatabase.attackUser(jsonData['user'],jsonData['keysNumber'],jsonData['attackuser'],jsonData['attackkeysNumber'],jsonData['killCount'], function(results)
				{
					console.log("setMoneyScore Success=",results.success," error=", results.error," money=",results.attackedMoney, " stash=",results.attackedStash, " killers=",results.attackedKillersNarc, " user=", results.attackeduser);
					connection.sendUTF(
				            JSON.stringify(
				            		{ success : results.success, 
				            		  error : results.error,
				            		  attackedMoney : results.attackedMoney,
				            		  attackedStash : results.attackedStash,
				            		  attackedKillersNarc : results.attackedKillersNarc,
				            		  attackeduser : results.attackeduser
				            		}));	
				});
	}
	else if(wantedAction == 'getAttacked')
	{
		SimpleDatabase.getAttacked(jsonData['user'],jsonData['keysNumber'], function(results)
				{
			console.log("getScore Success=",results.success," error=", results.error," faces=",results.faces, " gen=",results.genders, " users=",results.users, " keysNum=", results.keysNumbers);
			connection.sendUTF(
		            JSON.stringify(
		            		{ success : results.success, 
		            		  error : results.error,
		            		  faces : results.faces,
		            		  genders : results.genders,
		            		  users : results.users,
		            		  keysNumbers : results.keysNumbers,
		            		}));	
		});
	}
	else if(wantedAction == 'getScore')
	{
		SimpleDatabase.getScores(function(results)
				{
					console.log("getScore Success=",results.success," error=", results.error," faces=",results.faces, " gen=",results.genders, " users=",results.users, " user=", results.scores," igs= ",results.igs);
					connection.sendUTF(
				            JSON.stringify(
				            		{ success : results.success, 
				            		  error : results.error,
				            		  faces : results.faces,
				            		  genders : results.genders,
				            		  users : results.users,
				            		  scores : results.scores,
				            		  igs : results.igs
				            		}));	
				});
	}
	else if(wantedAction == 'getPlace')
	{
		SimpleDatabase.getPlace(jsonData['score'], function(results)
				{
					console.log("place=",results.place);
					connection.sendUTF(
				            JSON.stringify(
				            		{ success: results.success, 
				            		  error: results.error,
				            		  place : results.place
				            		}));	
				});
	}
	
}

