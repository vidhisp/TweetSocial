/*globals $:false*/
$(document).ready(function() {

	$.ajax({
		url: 'http://localhost:3000/currentUser',
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {
			if (data[0].logInFlag === 0) {
				var url = "http://localhost:8000/";
				window.location.replace(url);
			}
		},
		error: function(xhr, textStatus, errorThrown) {
			console.log("error");
			console.log("Error" + xhr + textStatus + errorThrown);
		}
	});

	displayPendingTweets();

	//loads twitter data
	function displayPendingTweets() {

		var uname, userCount;

		//gets the current date
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0!
		var yyyy = today.getFullYear();

		if (dd < 10) {
			dd = '0' + dd;
		}

		if (mm < 10) {
			mm = '0' + mm;
		}

		today = mm + '/' + dd + '/' + yyyy;


		$.ajax({
			url: 'http://localhost:3000/currentUser',
			type: "GET",
			dataType: 'json',
			success: function(data) {
				uname = data[0].username;
				$('#user').html("Hi, " + uname);
				$('#user12').html(uname);
				$('#uid').html(data[0].userid);
				$('#uid').hide();
			},
			error: function(xhr, textStatus, errorThrown) {
				alert("Error" + xhr + textStatus + errorThrown);
			}
		});


		$.ajax({
			url: 'http://localhost:3000/db',
			type: "GET",
			dataType: 'json',
			success: function(data) {

				var uname = $('#user').html().split(",");
				uname = $.trim(uname[1]);

				$.each(data, function(x, value) {

					var groupId = value.groupId;

					var userInGroup = "false";
					var showTweets = "false";


					if (typeof groupId !== "undefined") {
						//enables or disables the user to see tweets if user is part of group
						$.ajax({
							url: 'http://localhost:3000/group/' + groupId,
							type: "GET",
							dataType: 'json',
							success: function(data) {
								var userList = data.usergroup;
								userCount = userList.length;
								//console.log(userList);

								if (userList.indexOf(uname) > -1) {
									showTweets = "true";
									//alert(userCount);
									funSetShow(showTweets, userCount);
								}

							},
							error: function(xhr, textStatus, errorThrown) {
								alert("Error" + xhr + textStatus + errorThrown);
							}
						});

						function funSetShow(showTweets, userCount) {

							if (uname === value.username) {} else {
								//today = "03/29/2016";
								//case if today date is greater than schedule date and not posted on twitter then delete it
								if (today > value.date && value.postedOnTwitter === 0) {

									$.ajax({
										url: 'http://localhost:3000/db/' + value.id,
										type: "DELETE",
										dataType: 'json',
										success: function(data) {},
										error: function(xhr, textStatus, errorThrown) {
											alert("Error" + xhr + textStatus + errorThrown);
										}
									});
								} else {
									//alert(showTweets);
									if (showTweets === "true") {
										$("#postTweets").append(dbData(value, userCount));
									}
								}
							}


						} //function
					}

				});
			},
			error: function(xhr, textStatus, errorThrown) {
				alert("Error" + xhr + textStatus + errorThrown);
			}
		});


	}


	//generates dyanmic generated html
	function dbData(jsonData, userCount) {

		//alert(userCount);
		//console.log(jsonData);
		var userId = $('#uid').html();
		var verifyApproved = jsonData.approved;
		var idList = jsonData.appUserId; // list of id of user's who approved this tweet

		userCount = userCount - 1;

		//checks if tweet approved is greater than usercount
		if (verifyApproved >= userCount) {

			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();

			if (dd < 10) {
				dd = '0' + dd;
			}

			if (mm < 10) {
				mm = '0' + mm;
			}

			today = mm + '/' + dd + '/' + yyyy;
			today = "04/04/2016";


			if (today === jsonData.date && jsonData.postedOnTwitter === 0) {

				$.ajax({
					url: 'http://localhost:3000/db/' + jsonData.id,
					type: "PUT",
					contentType: 'application/json',
					data: JSON.stringify({
						approved: jsonData.approved,
						date: jsonData.date,
						tweet: jsonData.tweet,
						datePosted: jsonData.datePosted,
						postedOnTwitter: 1,
						username: jsonData.username,
						appUserId: jsonData.appUserId
					}),
					success: function(data) {
						var parameters = {
							tweet: jsonData.tweet
						};
						//post on twitter
						$.post('/tweetPost', parameters, function(data) {
							alert(" Status updated successfully on to the twitter");
							location.reload(true);
						});

					},
					error: function(xhr, textStatus, errorThrown) {
						alert("Error" + xhr + textStatus + errorThrown);
					}
				});

			} // don't show if already posted on twitter
			else if (jsonData.postedOnTwitter === 1) {

			}
			// disable approval since tweet schedule to be posted not equal to today's date
			else {
				$("#postTweets").append('<div class="post_body">');
				$("#postTweets").append('<div class="tweet_body"><span class="tweet">' + jsonData.tweet + '</span></div> ');
				$("#postTweets").append('<p class="description">&#0149;<span>' + "Posted on account: " + jsonData.datePosted + '</span> <span>' + "Posted by: " + jsonData.username + '</span> <span style="margin:0 0 0 75px"><button id="' + jsonData.id + '" type="button" class="btn btn-success btn-sm"> <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>  </span></p>');
				$("#postTweets").append('<hr style="border-color: #106cc8;border-width: 2px;"/>');
				$("#" + jsonData.id).prop("disabled", true);
			} //else
		} else {

			console.log(idList);
			console.log(idList.length);

			if (idList.length > 0 || idList.length === undefined) { // used undefined because not getting length of single no in javascript

				if (jsonData.postedOnTwitter === 1) { // it is for when tweet is already posted on twitter but no of user's increased since then
				} else {

					if (parseInt(idList) === parseInt(userId)) {
						$("#postTweets").append('<div class="post_body">');
						$("#postTweets").append('<div class="tweet_body"><span class="tweet">' + jsonData.tweet + '</span> </div> ');
						$("#postTweets").append('<p class="description">&#0149;<span>' + "Posted on account: " + jsonData.datePosted + '</span> <span>' + "Posted by: " + jsonData.username + '</span> <span style="margin:0 0 0 75px"> <button id="' + jsonData.id + '" type="button" class="btn btn-success btn-sm"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </button>  </span></p>');
						$("#postTweets").append('<hr style="border-color: #106cc8;border-width: 2px;"/>');
						$("#" + jsonData.id).prop("disabled", true);
					} else if (idList.length === undefined) {
						$("#postTweets").append('<div class="post_body">');
						$("#postTweets").append('<div class="tweet_body"><span class="tweet">' + jsonData.tweet + '</span> </div> ');
						$("#postTweets").append('<p class="description">&#0149;<span>' + "Posted on account: " + jsonData.datePosted + '</span> <span>' + "Posted by: " + jsonData.username + '</span> <span style="margin:0 0 0 75px"> <button id="' + jsonData.id + '" type="button" class="btn btn-success btn-sm"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </button>  </span></p>');
						$("#postTweets").append('<hr style="border-color: #106cc8;border-width: 2px;"/>');
					} else {
						var hasId = idList.indexOf(userId) != -1; //checks if userId already present in approved Idlist

						if (hasId === true) { //then disable approve button
							$("#postTweets").append('<div class="post_body">');
							$("#postTweets").append('<div class="tweet_body"><span  class="tweet" >' + jsonData.tweet + '</span> </div> ');
							$("#postTweets").append('<p class="description">&#0149;<span>' + "Posted on account: " + jsonData.datePosted + '</span> <span>' + "Posted by: " + jsonData.username + '</span> <span style="margin:0 0 0 75px"> <button id="' + jsonData.id + '" type="button" class="btn btn-success btn-sm"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </button> </span></p>');
							$("#postTweets").append('<hr style="border-color: #106cc8;border-width: 2px;"/>');
							$("#" + jsonData.id).prop("disabled", true);
						} else {
							$("#postTweets").append('<div class="post_body">');
							$("#postTweets").append('<div class="tweet_body"><span class="tweet">' + jsonData.tweet + '</span> </div> ');
							$("#postTweets").append('<p class="description"> &#0149;<span>' + "Posted on account: " + jsonData.datePosted + '</span> <span>' + "Posted by: " + jsonData.username + '</span> <span style="margin:0 0 0 75px"> <button id="' + jsonData.id + '" type="button" class="btn btn-success btn-sm"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </button> </span></p>');
							$("#postTweets").append('<hr style="border-color: #106cc8;border-width: 2px;"/>');
						}
					}
				}
			} else { //show approve button as no user's has approved it
				$("#postTweets").append('<div class="post_body">');
				$("#postTweets").append('<div class="tweet_body"><span class="tweet" >' + jsonData.tweet + '</span></div> ');
				$("#postTweets").append('<p class="description">&#0149;<span>' + "Posted on account: " + jsonData.datePosted + '</span> <span style="margin:0 0 0 10px">' + "Posted by: " + jsonData.username + '</span> <span style="margin:0 0 0 75px"> <button id="' + jsonData.id + '" type="button" class="btn btn-success btn-sm"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </button> </span></p>');
				$("#postTweets").append('<hr style="border-color: #106cc8;border-width: 2px;"/>');
			}

		}

	}

	//post tweet on twitter
	$("#postTweets").on("click", "button", function() {

		var rowId = $(this).attr("id");
		var approved, date, tweet, datePosted, appUserId, groupId;
		//alert(rowId);

		//updates approved for this it first gets the data and then updates it.
		$.ajax({

			url: 'http://localhost:3000/db/' + rowId,
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json',
			success: function(data) {
				var uid = $('#uid').html();

				approved = data.approved + 1;
				date = data.date;
				tweet = data.tweet;
				datePosted = data.datePosted;
				postedOnTwitter = data.postedOnTwitter;
				username = data.username;
				appUserId = data.appUserId;
				groupId = data.groupId;

				if (data.appUserId === "") {
					appUserId = "" + uid;
				} else {
					appUserId += ",";
					appUserId += uid;
				}

				$.ajax({
					url: 'http://localhost:3000/group/' + groupId,
					type: "GET",
					dataType: 'json',
					success: function(data) {
						var userList = data.usergroup;
						userCount = userList.length;
						updateApprove(approved, appUserId, userCount, groupId);

					},
					error: function(xhr, textStatus, errorThrown) {
						alert("Error" + xhr + textStatus + errorThrown);
					}
				});


				function updateApprove(approved, appUserId, userCount, groupId) {
					//alert(approved);alert(appUserId);alert(userCount);alert(groupId);

					// gets today date
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth() + 1; //January is 0!
					var yyyy = today.getFullYear();

					if (dd < 10) {
						dd = '0' + dd;
					}

					if (mm < 10) {
						mm = '0' + mm;
					}

					today = mm + '/' + dd + '/' + yyyy;


					if (approved >= userCount - 1) {
						// if today date is same as date schedule to post
						if (today === date) {

							$.ajax({
								url: 'http://localhost:3000/db/' + rowId,
								type: "PUT",
								contentType: 'application/json',
								data: JSON.stringify({
									approved: approved,
									date: date,
									tweet: tweet,
									datePosted: datePosted,
									postedOnTwitter: 1,
									username: username,
									groupId: groupId,
									appUserId: appUserId
								}),
								success: function(data) {
									var parameters = {
										tweet: tweet
									};
									$.post('/tweetPost', parameters, function(data) {
										alert(" Status updated successfully on to the twitter");
										//$("#"+data.id).prop("disabled", true);
										location.reload(true);
									});

								},
								error: function(xhr, textStatus, errorThrown) {
									alert("Error" + xhr + textStatus + errorThrown);
								}
							});
						} else {

							$.ajax({
								url: 'http://localhost:3000/db/' + rowId,
								type: "PUT",
								contentType: 'application/json',
								data: JSON.stringify({
									approved: approved,
									date: date,
									tweet: tweet,
									datePosted: datePosted,
									postedOnTwitter: postedOnTwitter,
									username: data.username,
									groupId: groupId,
									appUserId: appUserId
								}),
								success: function(data) {
									alert("Tweet is schedule to update on mentioned date");
									$("#" + data.id).prop("disabled", true);
								},
								error: function(xhr, textStatus, errorThrown) {
									alert("Error" + xhr + textStatus + errorThrown);
								}
							});
						} //else
					} //if
					else {
						$.ajax({
							url: 'http://localhost:3000/db/' + rowId,
							type: "PUT",
							contentType: 'application/json',
							data: JSON.stringify({
								approved: approved,
								date: date,
								tweet: tweet,
								datePosted: datePosted,
								postedOnTwitter: postedOnTwitter,
								username: data.username,
								groupId: groupId,
								appUserId: appUserId
							}),
							success: function(data) {
								alert("Tweet is scheduled to be updated");
								//location.reload(true)
								$("#" + data.id).prop("disabled", true);
							},
							error: function(xhr, textStatus, errorThrown) {
								alert("Error" + xhr + textStatus + errorThrown);
							}
						});
					}

				}

			},
			error: function(xhr, textStatus, errorThrown) {
				alert("Error" + xhr + textStatus + errorThrown);
			}
		});

	});




	//logouts
	$('#logout').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: 'http://localhost:3000/currentUser',
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json',
			success: function(data) {
				$.ajax({
					url: 'http://localhost:3000/currentUser/' + 1,
					type: "PUT",
					contentType: 'application/json',
					data: JSON.stringify({
						username: data[0].username,
						userid: data[0].id,
						logInFlag: 0
					}),
					success: function(data) {
						alert("logout successfully");
						var url = "http://localhost:8000/";
						window.location.replace(url);

					},
					error: function(xhr, textStatus, errorThrown) {
						alert("Error" + xhr + textStatus + errorThrown);
					}
				});
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log("error");
				console.log("Error" + xhr + textStatus + errorThrown);
			}
		});

	});



	//autofill textbox for group members

	$("#makegroup").attr("disabled", "disabled");

	var availableUsers = new Array();
	var usersGrp = [];

	//gets all register users
	$.ajax({
		url: 'http://localhost:3000/register',
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {
			var uname1 = $('#user').html().split(",");
			uname1 = $.trim(uname1[1]);
			for (var i = 0; i < data.length; i++) {
				if (uname1 == data[i].username) {} else {
					availableUsers.push(data[i].username);
				}
			}
		},
		error: function(xhr, textStatus, errorThrown) {
			console.log("error");
			console.log("Error" + xhr + textStatus + errorThrown);
		}
	});

	//data binding for autocomplete
	$("#groupmem").autocomplete({

		source: availableUsers,
		select: function(event, ui) {
			AutoCompleteSelectHandler(event, ui);
			$(this).val("");
			return false;
		}
	});


	//dynamically adds the user in above array
	function AutoCompleteSelectHandler(event, ui) {
		var grpLength = usersGrp.length + 1;
		//alert(grpLength);

		var selectedObj = ui.item;
		if (grpLength === 1) {
			$("#makegroup").attr("disabled", false);
			//$("#groupmem").attr("disabled", "disabled");
		}


		var index = availableUsers.indexOf(selectedObj.value);
		availableUsers.splice(index, 1);

		usersGrp.push(selectedObj.value);
		$("#grpUsers").append('<span id= "' + selectedObj.value + '" style="font-size: 1em;" class="label label-default">' + selectedObj.value + '</span> <button style="margin:0 0 0 10px" id="' + selectedObj.value + '" type="button" class="btn btn-danger btn-sm"><i class="glyphicon glyphicon-remove"></i></button> <br/>');
	}

	//for deleting user from array
	$("#grpUsers").on("click", "button", function() {
		var rowId = $(this).attr("id");
		availableUsers.push(rowId);
		var index = usersGrp.indexOf(rowId);
		usersGrp.splice(index, 1);

		//$(this).attr("id").next().remove();
		$('#' + rowId + '').remove();
		$(this).remove();

		if (usersGrp.length === 0) {
			$("#groupmem").attr("disabled", false);
			$("#makegroup").attr("disabled", true);
		}

	});


	//add users to group db with group name
	$('#makegroup').click(function(event) {

		event.preventDefault();
		var uname1 = $('#user').html().split(",");
		uname1 = $.trim(uname1[1]);
		usersGrp.push(uname1);

		var groupName = $('#groupName').val();

		$.ajax({
			url: 'http://localhost:3000/group',
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json',
			success: function(data) {
				var flag = 1;
				for (var i = 0; i < data.length; i++) {
					if (data[i].groupname === groupName) {
						flag = 0;
						alert("Enter different Group name:");
						location.reload();
						break;
					}
				}
				if (flag === 1 && groupName !== "") {
					$.ajax({
						url: 'http://localhost:3000/group',
						type: 'POST',
						contentType: 'application/json',
						data: JSON.stringify({
							usergroup: usersGrp,
							groupname: groupName
						}),
						success: function(data) {
							alert("Inserted successfully");
							$("#groupName").html("");
							location.reload();
						},
						error: function(xhr, textStatus, errorThrown) {
							console.log("error");
							console.log("Error" + xhr + textStatus + errorThrown);
						}

					}); //ajax
				} else if (groupName === "") {
					alert("please enter group name");
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log("error");
				console.log("Error" + xhr + textStatus + errorThrown);
			}
		});

	});


	//display of group
	$.ajax({
		url: 'http://localhost:3000/group',
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {
			//var  flag=1;
			var uname1 = $('#user').html().split(",");
			uname1 = $.trim(uname1[1]);
			//console.log(uname1)
			for (var i = 0; i < data.length; i++) {
				var x = data[i].usergroup;
				//console.log(x);
				//console.log("hey")
				$('#user12').html(uname1);
				if (x.includes(uname1)) {
					var z = '<div style="font-size: 1em;" id="gnamecss" >' + data[i].groupname + "</div>";
					$("#grpUsers1").append(z);
					for (var j = 0; j < data[i].usergroup.length; j++) {
						console.log(data[i].usergroup[j]);
						z = '<div style="font-size: 1em;"  id="unamecss">' + data[i].usergroup[j] + "</br>";
						$("#grpUsers1").append(z);
					}

				}
			}

		}
	});


});
