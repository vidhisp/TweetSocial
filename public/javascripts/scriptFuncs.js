// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
/*jshint latedef: false */
/*jshint -W108 */
/*jshint -W109 */
/*jshint -W020 */
// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
/*globals $:false*/
$(document).ready(function() {

	//gets username based on id
	"use strict";
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
			console.log(data[0].username);
			$('#user').html("Hi, " + data[0].username);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.log("error");
			console.log("Error" + xhr + textStatus + errorThrown);
		}
	});


	//gets groups
	$.ajax({
		url: 'http://localhost:3000/group',
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {

			if (data.length === 0) {
				$("#frm").hide();
				$('#divMess').show();
				$("#message").html("Please create the group first");

			} else {
				$("#frm").show();
				var username = $('#user').html().split(",");
				username = $.trim(username[1]);

				$.each(data, function(x, value) {

					var str = value.usergroup;
					if (str.indexOf(username) > -1) {
						$('select').append('<option id="' + value.id + '">' + value.groupname + '</option>');
					}
				});
			}

		},
		error: function(xhr, textStatus, errorThrown) {
			console.log("error");
			console.log("Error" + xhr + textStatus + errorThrown);
		}
	});



	//for character count twitter
	var $textarea = $('textarea');
	var $chars_remaining = $('#charCount');

	$textarea.keyup(function() {
		$chars_remaining.html((140 - parseInt($textarea.val().length)));
	});

	$textarea.keydown(function() {
		$chars_remaining.html((140 - parseInt($textarea.val().length)));
		$('#divMess').hide();
	});

	$("#datepicker").datepicker({
		minDate: 0
	});

	$('#divMess').hide();


	//for button submission
	$('#btnSubmit').click(function(event) {

		event.preventDefault();

		var groupname = $('#grpDrpDwn').val();
		var groupId = $('#grpDrpDwn').children(":selected").attr("id");

		var username = $('a', 'li.act').text().split(",");
		username = $.trim(username[1]);

		var tweet = $textarea.val();
		var date = $('#datepicker').val();

		var datePosted = new Date();
		var dd = datePosted.getDate();
		var mm = datePosted.getMonth() + 1; //January is 0!
		var yyyy = datePosted.getFullYear();

		if (dd < 10) {
			dd = '0' + dd;
		}

		if (mm < 10) {
			mm = '0' + mm;
		}

		datePosted = mm + '/' + dd + '/' + yyyy;

		if (tweet === "" || date === "") {
			$('#divMess').show();
			$("#message").html("Tweets can't be blank.. Thanks");
		} else {
			$.ajax({
				url: 'http://localhost:3000/db',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({
					tweet: tweet,
					approved: 0,
					date: date,
					datePosted: datePosted,
					postedOnTwitter: 0,
					username: username,
					groupname: groupname,
					groupId: groupId,
					appUserId: ""
				}),
				dataType: 'json',
				/*jshint unused:false*/
				success: function(data) {
					$('#divMess').show();
					$("#message").html("Tweet posted successfully");
				},
				error: function(xhr, textStatus, errorThrown) {
					console.log("Error" + xhr + textStatus + errorThrown);
				}
			});
		}

	});


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
					/*jshint unused:false*/

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

});
