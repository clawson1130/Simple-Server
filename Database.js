var http = require('http');
var mysql = require('mysql');
var util = require('util');
var net = require('net');

function SimpleDatabase(){
	this.errorMysqlCalled = false;
	this.errorMysqlMessage = "";
	
	console.log(" Constructor called");
    var connection = mysql.createPool({
    	host:"127.0.0.1",
    	user: "user",
    	pass: "pass",
    	port : '3306',
    	database : 'FirstDatabase',
    	connectionLimit : 10000
    });
    connection.on('error', function(err) {
    	  console.log(err.code); // 'ER_BAD_DB_ERROR'
    	  this.errorMysqlCalled = true;
    	  this.errorMysqlMessage = util.format("Error Connecting to Database. Error Code =%d",err.code);
    	  
    	});
    var hasuser = function(user , callback)
    {
    	var results; 
    	
    	connection.getConnection(function(err,conn){
			if(err)
			{
				console.log("errorReceived");
				results = {
				        success: false,
				        error: "Error connecting to Database."
				    };
					return callback(results);
				throw err;
			}
			else
			{
				var userQuery = util.format("SELECT Count(*) AS countNumber FROM First WHERE user = '%s'",user);
				console.log('user mysql connection successful');
				console.log(userQuery);
				
				conn.query(userQuery, function(err,rows,fields)
				{
							if (err) 
							{
								results = {
								        success: false,
								        error: "Error connecting to Database."
								    };
									return callback(results);
								throw err;
							}
							else
							{
								console.log(userQuery);
								console.log("userquERY RERCIVED");
								for(var i in rows)
								{
									console.log("Count =",rows[i].countNumber);
									var countNum = rows[i].countNumber;
									if(countNum > 0)
									{
										results = {
									        success: false,
									        error: "user already in use. Please try another."
									    };
										conn.release();
										return callback(results);
									}
									else
									{
										results = {
											success: true
										};
										return callback(results);
									}
								}
							}
				});
			}
    	});
    };
    var hasmail = function(mail,callback)
    {
    	var results;
    	
    	connection.getConnection(function(err,conn){
			if(err)
			{
				console.log("errorReceived");
				results = {
				        success: false,
				        error: "Error connecting to Database."
				    };
					return callback(results);
				throw err;
			}
			else
			{
				console.log('mysql connection successful');
				
				var mailQuery = util.format("SELECT Count(*) AS countNumber FROM First WHERE mail = '%s'",mail);
				console.log(mailQuery);
				
				conn.query(mailQuery, function(err,rows,fields)
				{
							if (err) throw err;
							console.log("mailquERY RERCIVED");
						
							for(var i in rows)
							{
								console.log("Count =",rows[i].countNumber);
								var countNum = rows[i].countNumber;
								if(countNum > 0)
								{
									results = {
								        success: false,
								        error: "mail already in use. Please try another."
								    };
									conn.release();
								    return callback(results);
								}
								else
								{
									results = {
										success: true,
									};
									return callback(results);
								}
							}
				});
			}
			/*results = {
			        success: false,
			        error: "Error connecting to Database."
			    };
				return callback(results);*/
		});
	};
	

 	this.registerUser= function(user,pass,mail,keys,callback){ 
 		
		console.log("Reiguster user ccalled");
		
		hasuser(user, function(results)
		{
			//console.log("Results =",results.success, "Text=", results.error);
			
			if(!results.success)
			{
				console.log("user success false");
				return callback(results);
			}
			else
			{
				hasmail(mail, function(results)
				{
					if(!results.success)
					{
						console.log("mail success false");
						return callback(results);
					}
					else
					{
						connection.getConnection(function(err,conn){
							if(err)
							{
								var results = {
										success: false,
										error: "ErrorConnecting to Database."
									};
									return callback(results);
								console.log("errorReceived");
								throw err;
							}
							else
							{
								console.log('mysql connection successful');
								var insertQuery = util.format("INSERT INTO First (user, pass, mail, keys, money, score) VALUES ('%s','%s','%s','%s','0','0')",user,pass,mail,keys);

								console.log(insertQuery);
								
								conn.query(insertQuery, function(err,rows,fields)
										{
											if (err)
											{
												console.log("InsertQuery error detected");
												var results = {
														success: false,
														error: "ErrorConnecting to Database."
													};
													return callback(results);
												throw err;
											}
											else
											{
												console.log(insertQuery);
												var results = {
													success: true,
													error: ""
												};
												conn.release();
												return callback(results);
											}
										});
							}
						});
					}
				});
			}
			
		});
	};

	this.signIn= function (user,pass,mail,callback) { 

		var results;
		
		connection.getConnection(function(err,conn){
		if(err)
		{
			results ={
					success: false,
					error : "Error Connecting to the Database."
				};
				return callback(results);
			throw err;
		}
		else
		{
			console.log('mysql connection successful');
			var queryString = util.format("SELECT * FROM `First` WHERE (mail='%s' AND pass='%s') OR (user='%s' AND pass='%s')",mail,pass,user,pass);
			
			conn.query(queryString, function(err,rows,fields)
					{
						if (err)
						{
							results ={
									success: false,
									error : "Error Connecting to the Database."
								};
								return callback(results);
							throw err;
						}
						for(var i in rows)
						{
							console.log("user =",rows[i].user," pass=",rows[i].pass," mail=",rows[i].mail," keys=",rows[i].keys," money=",rows[i].money," score=",rows[i].score);
							if(rows[i].user != "undefined")
							{
								results ={
									success: true,
									user:rows[i].user,
									mail: rows[i].mail,
									keys:rows[i].keys,
									money:rows[i].money,
									score:rows[i].score
								};
								conn.release();
								return callback(results);
							}
						}
						results = {
							success: false,
							error : "Did not find log in credentials in the database. Please try again?"
						};
						conn.release();
						return callback(results);
					});
		}
	});
	};
	this.setChar = function(user,keys,gender,charInfo, callback)
	{
		var results;
		var charArr = charInfo.split(",");
		
		connection.getConnection(function(err,conn){
		if(err)
		{
			results ={
					success: false,
					error : "Error Connecting to the Database."
				};
				return callback(results);
			throw err;
		}
		else
		{
			var countString = util.format("SELECT Count(*) AS countNumber FROM Second WHERE (user = '%s' AND keys = '%s')",user,keys);
			console.log(countString);
			
			conn.query(countString, function(err,rows,fields)
			{
						if (err) 
						{
							results ={
									success: false,
									error : "Error Connecting to the Database."
								};
								return callback(results);
							throw err;
						}
						
						var designQuery;
						for(var i in rows)
						{
							console.log("Count =",rows[i].countNumber);
							var countNum = rows[i].countNumber;
							if(countNum > 0)
							{
								console.log("contains character design");
								designQuery = util.format("UPDATE Second SET gender = '%s' , tint = '%d', nose ='%d', mouth ='%d', eyes ='%d', eyebrows ='%d', face ='%d', menhair ='%d', womenhair ='%d', haircolor ='%d', pants ='%d', pantsbottom ='%d', pantscolor ='%d', shoes ='%d', shoescolor ='%d', shirts ='%d', shirtsides ='%d', shirtcolor ='%d' WHERE (user ='%s' AND keys ='%s')",gender,charArr[0],charArr[1],charArr[2],charArr[3],charArr[4],charArr[5],charArr[6],charArr[7],charArr[8],charArr[9],charArr[10],charArr[11],charArr[12],charArr[13],charArr[14],charArr[15],charArr[16],user,keys);
								console.log(designQuery);
							}
							else
							{
								console.log("does not contain character design");
								designQuery = util.format("INSERT INTO Second (user,keys,gender,tint,nose,mouth,eyes,eyebrows,face,menhair,womenhair,haircolor,pants,pantsbottom,pantscolor,shoes,shoescolor,shirts,shirtsides,shirtcolor) VALUES ('%s','%s','%s',%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d)",user,keys,gender,charArr[0],charArr[1],charArr[2],charArr[3],charArr[4],charArr[5],charArr[6],charArr[7],charArr[8],charArr[9],charArr[10],charArr[11],charArr[12],charArr[13],charArr[14],charArr[15],charArr[16]);
								console.log(designQuery);
							}
						}
						conn.query(designQuery, function(err,rows,fields)
						{
							if (err)
							{
								results ={
										success: false,
										error : "Error Connecting to the Database."
									};
									return callback(results);
								throw err;
							}
							else
							{
								results = {
										success: true,
										error: ""
									};
									conn.release();
									return callback(results);
							}
						});
			});
			
		}
		
	});
	};
	this.loadChar = function(user,keys,callback)
	{
		var results;
		console.log("1");
		connection.getConnection(function(err,conn){
			if(err)
			{
				console.log("2");
				results ={
						success: false,
						error : "Error Connecting to the Database."
					};
					return callback(results);
				throw err;
			}
			else
			{
				console.log("3");
				var countString = util.format("SELECT Count(*) AS countNumber FROM Second WHERE (user = '%s' AND keys = '%s')",user,keys);
				console.log(countString);
				
				conn.query(countString, function(err,rows,fields)
				{
					console.log("4");
							if (err) 
							{
								results ={
										success: false,
										error : "Error Connecting to the Database."
									};
									return callback(results);
								throw err;
							}
							
							var countNum;
							for(var i in rows)
							{
								console.log("Count =",rows[i].countNumber);
								var countNum = rows[i].countNumber;
							}
							if(countNum == 0)
							{
								results ={
										success: false,
										error : "Could not find user in database."
									};
									conn.release();
									return callback(results);
							}
							var designQuery = util.format("SELECT * FROM Second WHERE (user ='%s' AND keys ='%s')",user,keys);
							console.log(designQuery);
							console.log("5");
							conn.query(designQuery, function(err,rows,fields)
							{
								console.log("6");
												if (err) 
												{
													console.log("Error");
													results ={
															success: false,
															error : "Error Connecting to the Database."
														};
														return callback(results);
													throw err;
												}
												console.log("CharInfo")
												
												for(var i in rows)
												{
													var charData = util.format("%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d",rows[i].tint,rows[i].nose,rows[i].mouth,rows[i].eyes,rows[i].eyebrows,rows[i].face,rows[i].menhair,rows[i].womenhair,rows[i].haircolor,rows[i].pants,rows[i].pantsbottom,rows[i].pantscolor,rows[i].shoes,rows[i].shoescolor,rows[i].shirts,rows[i].shirtsides,rows[i].shirtcolor);
													console.log(charData);
													results = {
															success: true,
															charInfo: charData,
															gender: rows[i].gender
													};
													conn.release();
													return callback(results);
												}
							});
							
				});
			}
		});
				
	};
	this.setMoneyScore = function(user,keys,money,score,callback)
	{
		var results;
		connection.getConnection(function(err,conn){
			if(err)
			{
				results ={
						success: false,
						error : "Error Connecting to the Database."
					};
					return callback(results);
				throw err;
			}
			else
			{
				var countString = util.format("SELECT Count(*) AS countNumber FROM First WHERE (user = '%s' AND keys = '%s')",user,keys);
				console.log(countString);
				
				conn.query(countString, function(err,rows,fields)
				{
							if (err) 
							{
								results ={
										success: false,
										error : "Error Connecting to the Database."
									};
									return callback(results);
								throw err;
							}
							
							var countNum;
							for(var i in rows)
							{
								console.log("Count =",rows[i].countNumber);
								var countNum = rows[i].countNumber;
							}
							if(countNum == 0)
							{
								results ={
										success: false,
										error : "Could not find user in database."
									};
									conn.release();
									return callback(results);
							}
							var designQuery = util.format("UPDATE First SET money = '%d' , score = '%d' WHERE (user ='%s' AND keys ='%s')",money,score,user,keys);
							console.log(designQuery);
							
							conn.query(designQuery, function(err,rows,fields)
							{
												if (err) 
												{
													console.log("Error");
													results ={
															success: false,
															error : "Error Connecting to the Database."
														};
														return callback(results);
													throw err;
												}
												else
												{
													console.log("moneyscore was successful");
													results ={
															success : true
													}
													conn.release();
													return callback(results)
												}
												console.log("CharInfo")
							
							});
							
				});
			}
		});
				
	};
	this.loadOnline = function(user,keys,callback)
	{
		var results;
		connection.getConnection(function(err,conn){
			if(err)
			{
				results ={
						success: false,
						error : "Error Connecting to the Database."
					};
					return callback(results);
				throw err;
			}
			else
			{
				var countString = util.format("SELECT Count(*) AS countNumber FROM Third WHERE (user = '%s' AND keys = '%s')",user,keys);
				console.log(countString);
				
				conn.query(countString, function(err,rows,fields)
				{
							if (err) 
							{
								results ={
										success: false,
										error : "Error Connecting to the Database."
									};
									return callback(results);
								throw err;
							}
							
							var countNum;
							for(var i in rows)
							{
								console.log("Count =",rows[i].countNumber);
								var countNum = rows[i].countNumber;
							}
							if(countNum == 0)
							{
								results ={
										success: false,
										error : "Could not find user in database."
									};
									conn.release();
									return callback(results);
							}
							var designQuery = util.format("SELECT * FROM Third WHERE (user ='%s' AND keys ='%s')",user,keys);
							console.log(designQuery);
							
							conn.query(designQuery, function(err,rows,fields)
							{
												if (err) 
												{
													console.log("Error");
													results ={
															success: false,
															error : "Error Connecting to the Database."
														};
														return callback(results);
													throw err;
												}
												console.log("CharInfo")
												
												for(var i in rows)
												{
													console.log("CharInfo")
													var charData = util.format("%s,%d,%d,%d,%d,%s,%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%d,%d,%s,%s,%d,%s",rows[i].lemonades,rows[i].water,rows[i].juice,rows[i].sugar,rows[i].lemons,rows[i].lemonadeStashed,rows[i].moneyStashed,rows[i].custName,rows[i].custGender,rows[i].custCombined,rows[i].custNarc,rows[i].custNarcPerc,rows[i].custSellPrice,rows[i].custTotal,rows[i].cookerName,rows[i].cookerGender,rows[i].cookerCombined,rows[i].cookerNarc,rows[i].cookerNarcPerc,rows[i].cookerSalary,rows[i].cookerTotal,rows[i].cookerAmountMade,rows[i].cookerAddictPercent,rows[i].cookerAddict,rows[i].cookerAllowCook,rows[i].cookerPotent,rows[i].killerName,rows[i].killerGender,rows[i].killerCombined,rows[i].killerNarc,rows[i].killerNarcPerc,rows[i].killerTotal,rows[i].sellerName,rows[i].sellerGender,rows[i].sellerCombined,rows[i].sellerNarc,rows[i].sellerNarcPerc,rows[i].sellerSellPrice,rows[i].sellerTotal,rows[i].sellerCurrentSupply,rows[i].sellerScamPercent,rows[i].sellerScam,rows[i].sellerPercentCut,rows[i].Third,rows[i].attacked,rows[i].attackuser,rows[i].attackkeys,rows[i].attackKillerCount,rows[i].igHandle);
													console.log("CharInfo")
													console.log(charData);
													results = {
															success: true,
															lemonades : rows[i].lemonades,
															water : rows[i].water,
															juice: rows[i].juice, 
															sugar: rows[i].sugar ,
															lemons : rows[i].lemons ,
															lemonStashed : rows[i].lemonadeStashed, 
															moneyStashed: rows[i].moneyStashed,
															custName: rows[i].custName ,
															custGender : rows[i].custGender, 
															custCombined : rows[i].custCombined, 
															custNarc : rows[i].custNarc ,
															custNarcPerc : rows[i].custNarcPerc, 
															custSellPrice: rows[i].custSellPrice, 
															custTotal : rows[i].custTotal ,
															cookerName : rows[i].cookerName ,
															cookerGender : rows[i].cookerGender, 
															cookerCombined : rows[i].cookerCombined, 
															cookerNarc : rows[i].cookerNarc ,
															cookerNarcPerc : rows[i].cookerNarcPerc, 
															cookerSalary: rows[i].cookerSalary ,
															cookerTotal : rows[i].cookerTotal ,
															cookerAmountMade : rows[i].cookerAmountMade ,
															cookerAddictPercent : rows[i].cookerAddictPercent, 
															cookerAddict : rows[i].cookerAddict ,
															cookerAllowCook : rows[i].cookerAllowCook, 
															cookerPotent : rows[i].cookerPotent ,
															killerName: rows[i].killerName ,
															killerGender : rows[i].killerGender, 
															killerCombined : rows[i].killerCombined, 
															killerNarc : rows[i].killerNarc ,
															killerNarcPerc : rows[i].killerNarcPerc, 
															killerTotal : rows[i].killerTotal ,
															sellerName : rows[i].sellerName ,
															sellerGender : rows[i].sellerGender, 
															sellerCombined : rows[i].sellerCombined, 
															sellerNarc : rows[i].sellerNarc ,
															sellerNarcPerc : rows[i].sellerNarcPerc, 
															sellerSellPrice : rows[i].sellerSellPrice, 
															sellerTotal : rows[i].sellerTotal ,
															sellerCurrentSupply : rows[i].sellerCurrentSupply, 
															sellerScamPercent : rows[i].sellerScamPercent ,
															sellerScam : rows[i].sellerScam ,
															sellerPercentCut: rows[i].sellerPercentCut, 
															online : rows[i].online ,
															attacked : rows[i].attacked, 
															attackuser : rows[i].attackuser, 
															attackkeys : rows[i].attackkeys, 
															attackKillerCount : rows[i].attackKillerCount, 
															igHandle : rows[i].igHandle
													};
													conn.release();
													return callback(results);
												}
							});
							
				});
			}
		});
				
	};
	this.setOnline = function(user,keys,lemonades,water,juice,sugar,lemons,lemonadeStashed,moneyStashed,custName,custGender,custCombined,custNarc,custNarcPerc,custSellPrice,custTotal,cookerName,cookerGender,cookerCombined,cookerNarc,cookerNarcPerc,cookerSalary,cookerTotal,cookerAmountMade,cookerAddictPercent,cookerAddict,cookerAllowCook,cookerPotent,killerName,killerGender,killerCombined,killerNarc,killerNarcPerc,killerTotal,sellerName,sellerGender,sellerCombined,sellerNarc,sellerNarcPerc,sellerSellPrice,sellerTotal,sellerCurrentSupply,sellerScamPercent,sellerScam,sellerPercentCut,online,attacked,attackuser,attackkeys,attackKillerCount,ighandle,callback)
	{
		var results;
		//var charArr = charInfo.split(",");
		
		connection.getConnection(function(err,conn){
		if(err)
		{
			results ={
					success: false,
					error : "Error Connecting to the Database."
				};
				return callback(results);
			throw err;
		}
		else
		{
			var countString = util.format("SELECT Count(*) AS countNumber FROM Third WHERE (user = '%s' AND keys = '%s')",user,keys);
			console.log(countString);
			
			conn.query(countString, function(err,rows,fields)
			{
						if (err) 
						{
							results ={
									success: false,
									error : "Error Connecting to the Database."
								};
								return callback(results);
							throw err;
						}
						
						var designQuery;
						for(var i in rows)
						{
							console.log("Count =",rows[i].countNumber);
							var countNum = rows[i].countNumber;
							if(countNum > 0)
							{
								console.log("contains character design");
								designQuery = util.format("UPDATE Third SET lemonades = '%s' ,water = '%d' ,juice = '%d' ,sugar = '%d' ,lemons = '%d' ,lemonadeStashed = '%s' ,moneyStashed = '%d' ,custName = '%s' ,custGender = '%s' ,custCombined = '%s' ,custNarc = '%s' ,custNarcPerc = '%s' ,custSellPrice = '%s' ,custTotal = '%s' ,cookerName = '%s' ,cookerGender = '%s' ,cookerCombined = '%s' ,cookerNarc = '%s' ,cookerNarcPerc = '%s' ,cookerSalary = '%s' ,cookerTotal = '%s' ,cookerAmountMade = '%s' ,cookerAddictPercent = '%s' ,cookerAddict = '%s' ,cookerAllowCook = '%s' ,cookerPotent = '%s' ,killerName = '%s' ,killerGender = '%s' ,killerCombined = '%s' ,killerNarc = '%s' ,killerNarcPerc = '%s' ,killerTotal = '%s' ,sellerName = '%s' ,sellerGender = '%s' ,sellerCombined = '%s' ,sellerNarc = '%s' ,sellerNarcPerc = '%s' ,sellerSellPrice = '%s' ,sellerTotal = '%s' ,sellerCurrentSupply = '%s' ,sellerScamPercent = '%s' ,sellerScam = '%s' ,sellerPercentCut = '%s' ,online = '%d' ,attacked = '%d', ighandle ='%s' WHERE (user ='%s' AND keys ='%s')",lemonades,water,juice,sugar,lemons,lemonadeStashed,moneyStashed,custName,custGender,custCombined,custNarc,custNarcPerc,custSellPrice,custTotal,cookerName,cookerGender,cookerCombined,cookerNarc,cookerNarcPerc,cookerSalary,cookerTotal,cookerAmountMade,cookerAddictPercent,cookerAddict,cookerAllowCook,cookerPotent,killerName,killerGender,killerCombined,killerNarc,killerNarcPerc,killerTotal,sellerName,sellerGender,sellerCombined,sellerNarc,sellerNarcPerc,sellerSellPrice,sellerTotal,sellerCurrentSupply,sellerScamPercent,sellerScam,sellerPercentCut,online,attacked,ighandle,user,keys);
								console.log(designQuery);
							}
							else
							{
								console.log("does not contain character design");
								designQuery = util.format("INSERT INTO Third (user,keys,lemonades,water,juice,sugar,lemons,lemonadeStashed,moneyStashed,custName,custGender,custCombined,custNarc,custNarcPerc,custSellPrice,custTotal,cookerName,cookerGender,cookerCombined,cookerNarc,cookerNarcPerc,cookerSalary,cookerTotal,cookerAmountMade,cookerAddictPercent,cookerAddict,cookerAllowCook,cookerPotent,killerName,killerGender,killerCombined,killerNarc,killerNarcPerc,killerTotal,sellerName,sellerGender,sellerCombined,sellerNarc,sellerNarcPerc,sellerSellPrice,sellerTotal,sellerCurrentSupply,sellerScamPercent,sellerScam,sellerPercentCut,online,attacked,attackuser,attackkeys,attackKillerCount,ighandle) VALUES ('%s','%s','%s',%d,%d,%d,%d,'%s',%d,'%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%d','%d','%s','%s','%d','%s')",user,keys,lemonades,water,juice,sugar,lemons,lemonadeStashed,moneyStashed,custName,custGender,custCombined,custNarc,custNarcPerc,custSellPrice,custTotal,cookerName,cookerGender,cookerCombined,cookerNarc,cookerNarcPerc,cookerSalary,cookerTotal,cookerAmountMade,cookerAddictPercent,cookerAddict,cookerAllowCook,cookerPotent,killerName,killerGender,killerCombined,killerNarc,killerNarcPerc,killerTotal,sellerName,sellerGender,sellerCombined,sellerNarc,sellerNarcPerc,sellerSellPrice,sellerTotal,sellerCurrentSupply,sellerScamPercent,sellerScam,sellerPercentCut,online,attacked,attackuser,attackkeys,attackKillerCount,ighandle);
								console.log(designQuery);
							}
						}
						conn.query(designQuery, function(err,rows,fields)
						{
							if (err)
							{
								results ={
										success: false,
										error : "Error Connecting to the Database."
									};
									return callback(results);
								throw err;
							}
							else
							{
								results = {
										success: true,
										error: ""
									};
									conn.release();
									return callback(results);
							}
						});
			});
			
		}
		
	});
	};
	this.attackUser = function(user,keys,attackuser,attackkeys,killCount,callback)
	{
		var results;
		var attackMoney;
		var attackStash;
		var attackKillersNarc
		var returneduser;
		connection.getConnection(function(err,conn){
			if(err)
			{
				results ={
						success: false,
						error : "Error Connecting to the Database."
					};
					return callback(results);
				throw err;
			}
			else
			{
				var countString = util.format("SELECT Count(*) AS countNumber FROM Third WHERE (user = '%s' AND keys = '%s')",user,keys);
				console.log(countString);
				
				conn.query(countString, function(err,rows,fields)
				{
							if (err) 
							{
								results ={
										success: false,
										error : "Error Connecting to the Database."
									};
									return callback(results);
								throw err;
							}
							
							var countNum;
							for(var i in rows)
							{
								console.log("Count =",rows[i].countNumber);
								var countNum = rows[i].countNumber;
							}
							if(countNum == 0)
							{
								results ={
										success: false,
										error : "Could not find user in database."
									};
									conn.release();
									return callback(results);
							}
							var designQuery = util.format("SELECT t1.user,t2.money,t1.lemonades,t1.killerNarc,t1.attacked FROM Third t1, First t2  WHERE (t1.user ='%s' AND t2.keys ='%s' AND t1.keys ='%s')",attackuser,attackkeys,attackkeys);
							console.log(designQuery);
							
							conn.query(designQuery, function(err,rows,fields)
							{
												if (err) 
												{
													console.log("Error");
													results ={
															success: false,
															error : "Error Connecting to the Database."
														};
														return callback(results);
													throw err;
												}
												else
												{
													console.log("select attack was successful");
													if(rows[0].attacked == 1)
													{
														results ={
																success: false,
																error : util.format("%s is currently being attacked by another user. Try another user.",attackuser)
															};
															conn.release();
															return callback(results);
													}
													attackMoney = rows[0].money;
													attackStash = rows[0].lemonades
													attackKillersNarc = rows[0].killerNarc;
													returneduser = rows[0].user;
													console.log("money=",attackMoney," stash=",attackStash," lemonades=",rows[0].lemonades, " narc",rows[0].killerNarc);
													var updateQuery = util.format("UPDATE Third SET attacked = '1', attackuser = '%s', attackkeys = '%s', attackKillerCount = '%d' WHERE (user ='%s' AND keys ='%s')",user,keys,killCount,attackuser,attackkeys);
													
													console.log(updateQuery);
													
													conn.query(updateQuery, function(err,rows,fields)
													{
																		if (err) 
																		{
																			console.log("Error");
																			results ={
																					success: false,
																					error : "Error Connecting to the Database."
																				};
																				return callback(results);
																			throw err;
																		}
																		else
																		{
																			console.log("Update Online Attacked");
																			results ={
																					success: true,
																					attackedMoney : attackMoney,
																					attackedStash : attackStash ,
																					attackedKillersNarc : attackKillersNarc,
																					attackeduser : returneduser 
																				};
																				conn.release();
																				return callback(results);
																		}
																
													
													});
												}
												console.log("CharInfo")
							
							});
							
				});
			}
		});
				
	};
	this.getAttacked = function(user,keys,callback)
	{
		var results;
		var facestring = "";
		var genderString = "";
		var userString = "";
		var keyString = "";
		connection.getConnection(function(err,conn){
			if(err)
			{
				results ={
						success: false,
						error : "Error Connecting to the Database."
					};
					return callback(results);
				throw err;
			}
			else
			{
				var countString = util.format("SELECT * FROM Third t1, Second t2 WHERE (t1.user = t2.user AND t2.keys = t1.keys AND t1.user <> '%s' AND t1.keys <> '%s' AND t1.online <> '0' AND t1.attacked <> '1' ) ORDER BY RAND() LIMIT 10",user,keys);

				console.log(countString);
				
				conn.query(countString, function(err,rows,fields)
				{
					if(err)
					{
						console.log("Errorrightthere");
						results ={
								success: false,
								error : "Error getting Database information."
							};
							return callback(results);
						throw err;
					}
					else
					{
						console.log("rightthere");
						for(var i in rows)
						{
							var charData = util.format("%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d",rows[i].tint,rows[i].nose,rows[i].mouth,rows[i].eyes,rows[i].eyebrows,rows[i].face,rows[i].menhair,rows[i].womenhair,rows[i].haircolor,rows[i].pants,rows[i].pantsbottom,rows[i].pantscolor,rows[i].shoes,rows[i].shoescolor,rows[i].shirts,rows[i].shirtsides,rows[i].shirtcolor);
							var gender = rows[i].gender
							console.log("fallinline",i);
							if(i == 0)
							{
								facestring = charData
								genderString= gender
								userString = rows[i].user
								keyString = rows[i].keys
							}
							else
							{
								facestring = util.format("%s|%s",facestring,charData)
								genderString= util.format("%s|%s",genderString,gender)
								userString = util.format("%s|%s",userString,rows[i].user)
								keyString = util.format("%s|%s",keyString,rows[i].keys)
							}
						}
						var what = util.format("facestring=%s gender=%s userstring=%s keyString=%s",facestring,genderString,userString,keyString);
						console.log(what);
						results ={
								success : true,
								faces : facestring,
								genders : genderString,
								users : userString,
								keyss : keyString
							};
							conn.release();
							return callback(results);
					}
					
				});
			}
		});
	}
	this.getScores = function(callback)
	{
		var results;
		var facestring = "";
		var genderString = "";
		var userString = "";
		var scoreString = "";
		var igString = ""
		
		connection.getConnection(function(err,conn){
			if(err)
			{
				results ={
						success: false,
						error : "Error Connecting to the Database."
					};
					return callback(results);
				throw err;
			}
			else
			{
				var countString = util.format("SELECT * FROM Third t1, Second t2, First t3  WHERE (t1.user = t2.user AND t3.user = t2.user AND t1.user = t3.user ) ORDER BY t3.score DESC LIMIT 50");

				console.log(countString);
				
				conn.query(countString, function(err,rows,fields)
				{
					if(err)
					{
						console.log("Errorrightthere");
						results ={
								success: false,
								error : "Error getting Database information."
							};
							return callback(results);
						throw err;
					}
					else
					{
						console.log("rightthere");
						for(var i in rows)
						{
							var charData = util.format("%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d",rows[i].tint,rows[i].nose,rows[i].mouth,rows[i].eyes,rows[i].eyebrows,rows[i].face,rows[i].menhair,rows[i].womenhair,rows[i].haircolor,rows[i].pants,rows[i].pantsbottom,rows[i].pantscolor,rows[i].shoes,rows[i].shoescolor,rows[i].shirts,rows[i].shirtsides,rows[i].shirtcolor);
							var gender = rows[i].gender
							console.log("fallinline",i);
							if(i == 0)
							{
								var facestring = charData;
								var genderString = gender;
								var userString = rows[i].user;
								var scoreString = rows[i].score;
								var igString = rows[i].igHandle 
							}
							else
							{
								facestring = util.format("%s|%s",facestring,charData);
								genderString= util.format("%s|%s",genderString,gender);
								userString = util.format("%s|%s",userString,rows[i].user);
								scoreString = util.format("%s|%s",scoreString,rows[i].score);
								igString = util.format("%s|%s",igString,rows[i].igHandle);
							}
						}
						var what = util.format("facestring=%s gender=%s userstring=%s scoreString=%s igString=%s",facestring,genderString,userString,scoreString,igString);
						console.log(what);
						results ={
								success : true,
								faces : facestring,
								genders : genderString,
								users : userString,
								scores : scoreString,
								igs : igString
							};
							conn.release();
							return callback(results);
					}
					
				});
			}
		});
	}
	this.getPlace = function(score,callback)
	{
		var results;

		connection.getConnection(function(err,conn){
			if(err)
			{
				results ={
						success: false,
						error : "Error Connecting to the Database."
					};
					return callback(results);
				throw err;
			}
			else
			{
				var countString = util.format("SELECT Count(*) AS countNumber FROM First WHERE (score > %d)",score);

				console.log(countString);
				
				conn.query(countString, function(err,rows,fields)
				{
					if(err)
					{
						console.log("Errorrightthere");
						results ={
								success: false,
								error : "Error getting Database information."
							};
							return callback(results);
						throw err;
					}
					else
					{
						var countnum = rows[0].countNumber + 1;
						console.log("printcountnumscore> =",countnum);
						results ={
								success : true,
								place : countnum
							};
							conn.release();
							return callback(results);
					}
					
				});
			}
		});
	}
}


module.exports = {  
		SimpleDatabase: SimpleDatabase
	}

