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

	"use strict";
	$('#divMess').hide();

	$.ajax({
		url: 'http://localhost:3000/currentUser',
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {
			if (data.length > 0) {
				if (data[0].logInFlag === 1) {
					var url = "http://localhost:8000/index.html";
					window.location.replace(url);
				}
			}
		},
		error: function(xhr, textStatus, errorThrown) {
			console.log("error");
			console.log("Error" + xhr + textStatus + errorThrown);
		}
	});


	$("#username").keydown(function() {
		$('#divMess').hide();
	});

	$("#password").keydown(function() {
		$('#divMess').hide();
	});

	$('#submit').click(function(event) {

		event.preventDefault();

		var username = $('#username').val();
		var password = $('#password').val();

		if (username === "" || password === "") {
			$('#divMess').show();
			$('#message').html("username and password can't be blank");
		} else {
			$.ajax({
				url: 'http://localhost:3000/register',
				type: 'GET',
				contentType: 'application/json',
				dataType: 'json',
				success: function(data) {

					//for first time
					if (JSON.stringify(data) === '[]') {

						$.ajax({
							url: 'http://localhost:3000/register',
							type: 'POST',
							contentType: 'application/json',
							data: JSON.stringify({
								username: username,
								password: password
							}),
							dataType: 'json',
							success: function(dataG) {

								$.ajax({
									url: 'http://localhost:3000/currentUser',
									type: 'GET',
									contentType: 'application/json',
									dataType: 'json',
									success: function(data) {

										if (JSON.stringify(data) === '[]') {
											$.ajax({
												url: 'http://localhost:3000/currentUser',
												type: 'POST',
												contentType: 'application/json',
												data: JSON.stringify({
													username: username,
													userid: dataG.id,
													logInFlag: 1
												}),
												/*jshint unused:false*/
												success: function(data) {
													alert("Register successfully");
													//var url = "http://localhost:8000/index.html/" + data.id;
													var url = "http://localhost:8000/index.html";
													window.location.replace(url);
													return false;
												},
												error: function(xhr, textStatus, errorThrown) {
													console.log("error");
													console.log("Error" + xhr + textStatus + errorThrown);
												}

											}); //ajax inner
										} //if

									},
									error: function(xhr, textStatus, errorThrown) {
										console.log("error");
										console.log("Error" + xhr + textStatus + errorThrown);
									}

								}); //ajax
							}, //success
							error: function(xhr, textStatus, errorThrown) {
								console.log("error");
								console.log("Error" + xhr + textStatus + errorThrown);
							}

						}); //ajax
						return false;

					} else {

						//var username = $('#username').val();
						var flag = 0;

						for (var i = data.length - 1; i >= 0; i--) {
							if (data[i].username === username) {
								flag = 1;
								break;
							}
						}

						if (flag === 1) {
							$('#divMess').show();
							$("#message").html("User is already present");

						} else {
							$.ajax({
								url: 'http://localhost:3000/register',
								type: 'POST',
								contentType: 'application/json',
								data: JSON.stringify({
									username: username,
									password: password
								}),
								dataType: 'json',
								success: function(dataG) {
									alert("Register successfully");

									//also updates current user
									$.ajax({
										url: 'http://localhost:3000/currentUser/' + 1,
										type: 'PUT',
										contentType: 'application/json',
										data: JSON.stringify({
											username: username,
											userid: dataG.id,
											logInFlag: 1
										}),
										/*jshint unused:false*/

										success: function(data) {
											var url = "http://localhost:8000/index.html";
											window.location.replace(url);
											return false;
										},
										error: function(xhr, textStatus, errorThrown) {
											console.log("error");
											console.log("Error" + xhr + textStatus + errorThrown);
										}

									});
								},
								error: function(xhr, textStatus, errorThrown) {
									console.log("error");
									console.log("Error" + xhr + textStatus + errorThrown);
								}

							});
						}
					}
				},
				error: function(xhr, textStatus, errorThrown) {
					console.log("error");
					console.log("Error" + xhr + textStatus + errorThrown);
				}

			});
		}

	});
});
