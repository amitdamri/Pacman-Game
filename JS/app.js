
var users;
var loginUser;


$(document).ready(function () {
	users = [];
	addUserP();
	setListeners();
	setRegistrationRules();
	setSettingsRules();
	switchScreen("#welcomeScreen");

});

/**This class represents a user in the system - with all of its values */
class User {
	constructor(username, password, firstName, lastName, email, birthdate) {
		this.username = username;
		this.password = password;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.birthdate = birthdate;
	}
}

/**Adds default uesr p to the system*/
function addUserP() {
	let p_user = new User("p", "p");
	users.push(p_user);
}


/*********************************
***********Listeners**************
**********************************/

/**Listeners of the Welcome buttons*/
function welcomeScreenButtonListeners() {

	/**Register button*/
	$("#registerButton").click(function () {
		switchScreen("#registerScreen");
	});

	/**Login button */
	$("#loginbutton").click(function () {
		switchScreen("#loginScreen");
	});
}

/**Listeners of the Login button*/
function loginScreenButtonListener() {
	/**Connect button**/
	$("#connectbutton").click(function () {
		Login();
		return false;
	});
}

/**Listeners of the menu bar links*/
function menuBarListeners() {

	$("#welcomeMenu").click(function () {
		switchScreen("#welcomeScreen");
		return false;
	});

	$("#registerMenu").click(function () {
		switchScreen("#registerScreen");
		return false;
	});

	$("#loginMenu").click(function () {
		switchScreen("#loginScreen");
		return false;
	});
}

/**Listeners of the Settings options*/
function SettingListeners() {

	/**
	 * sets the keyboard keys - changes the value of the textbox according 
	 * to the inserted key, and sets the right key in the array.
	 */
	$("#upKey").keydown(function (event) {
		if (!keysEquals(0, event.keyCode)) {
			setSingleKey(0, event.keyCode);
			document.getElementById('upKey').value = event.code;
		} else {
			alert("Cannot choose same keys for different direction. Please try again.")
		}
	});

	$("#downKey").keydown(function (event) {
		if (!keysEquals(1, event.keyCode)) {
			setSingleKey(1, event.keyCode);
			document.getElementById('downKey').value = event.code;
		} else {
			alert("Cannot choose same keys for different direction. Please try again.");
		}
	});

	$("#leftKey").keydown(function (event) {
		if (!keysEquals(2, event.keyCode)) {
			setSingleKey(2, event.keyCode);
			document.getElementById('leftKey').value = event.code;
		} else {
			alert("Cannot choose same keys for different direction. Please try again.")
		}
	});

	$("#rightKey").keydown(function (event) {
		if (!keysEquals(3, event.keyCode)) {
			setSingleKey(3, event.keyCode);
			document.getElementById('rightKey').value = event.code;
		} else {
			alert("Cannot choose same keys for different direction. Please try again.")
		}
	});

	/**Sets the listener of the random key */
	$("#randomSettings").click(function () {
		randomizeSettings();
		switchScreen("#gameScreen");
	});

}

/**Listeners of the about link on the menu bar */
function aboutMenuListeners() {

	let about_modal = document.getElementById("aboutModalDialog");

	$("#aboutMenu").click(function () {
		about_modal.style.display = "block";
		aboutModalOpened();
		return false;
	});

	/**Close the about screen when the user clicks on (x) **/
	$(".close").click(function () {
		if (about_modal.style.display == "block") {
			about_modal.style.display = "none";
			aboutModalClosed();
			return true;
		}
	});

	/**Close the about screen when the user clicks on the window **/
	$(window).click(function (event) {
		if (about_modal.style.display == "block" && event.target == about_modal) {
			about_modal.style.display = "none";
			aboutModalClosed();
			return true;
		}
	});

	/**Close the about screen when the user clicks on Escape button **/
	document.addEventListener('keyup', function (event) {
		if (event.keyCode == 27 && about_modal.style.display == "block") {
			about_modal.style.display = "none";
			aboutModalClosed();
			return true;
		}
	});
}

/**Sets all the listeners*/
function setListeners() {
	welcomeScreenButtonListeners();
	loginScreenButtonListener();
	menuBarListeners();
	SettingListeners();
	aboutMenuListeners();

}


/*********************************
***********Validations************
**********************************/

/**Sets registration rules */
function setRegistrationRules() {

	$("#registrationForm").validate({
		rules: {
			username: "required",
			firstName: {
				required: true,
				pattern: /^[a-zA-Z]+$/
			},
			lastName: {
				required: true,
				pattern: /^[a-zA-Z]+$/
			},
			password: {
				required: true,
				minlength: 6,
				pattern: /^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$/ // contains at least one digit and one letter
			},
			email: {
				required: true,
				email: true
			},
			birthdate: {
				required: true,
				date: true
			}
		},
		messages: {
			username: "Please enter your username.",
			firstName: {
				required: "Please enter your first name.",
				pattern: "Only letters are allowed."
			},
			lastName: {
				required: "Please enter your last name.",
				pattern: "Only letters are allowed."
			},
			password: {
				required: "Please provide a password.",
				minlength: "Your password must be at least 6 characters long.",
				pattern: "Password must contain at least one digit and one letter."
			},
			email: "Please enter a valid email address.",
			birthdate: "Please enter a valid date."
		},
		submitHandler: function (form) {
			Register(form);
		}
	});

}

/**Sets settings rules */
function setSettingsRules() {

	/**checks the inserted values */
	$("#settingsForm").validate({
		rules: {
			numberOfBalls: {
				required: true,
				BallsConstraint: true
			},
			numberOfMonsters: {
				required: true,
				MonstersConstraint: true,
			},
			gameLength: {
				required: true,
				GameLengthConstraint: true,
			},
		},
		submitHandler: function (form) {
			setSettings(form);
			switchScreen("#gameScreen");
		}
	});

	/**Number of balls must be between 50 and 90 */
	jQuery.validator.addMethod("BallsConstraint", function (value, element) {
		return this.optional(element) || (value >= 50 && value <= 90);
	}, "Please insert number between 50 and 90.");

	/**Number of monsters must be between 50 and 90 */
	jQuery.validator.addMethod("MonstersConstraint", function (value, element) {
		return this.optional(element) || (value >= 1 && value <= 4);
	}, "Please insert number between 1 and 4.");

	/**Game length must be greater than 60 sec */
	jQuery.validator.addMethod("GameLengthConstraint", function (value, element) {
		return this.optional(element) || (value >= 60);
	}, "Game length should be greater than 60 seconds.");

}

/**Switches between screens according to the sequence of the user clicks*/
function switchScreen(div) {

	/**shows settings info on the side menu bar*/
	if (div == "#gameScreen") {
		$("#settingsInfo").css('visibility', 'visible');
		Start(loginUser);
	} else {
		//removes game Key listener and stops interval if running
		stopGame();

		/**resets forms before using it again*/
		if (div == "#loginScreen" || div == "#registerScreen") {
			$("form").trigger("reset");
		}

		/**hide settings on the menu bar if the current screen is not the gameScreen */
		if ($("#settingsInfo").css('visibility') == 'visible') {
			$("#settingsInfo").css('visibility', 'hidden');
		}
	}

	/**switch screens - only the required div is visible */
	$(".hidden").css('visibility', 'hidden');
	$(div).css('visibility', 'visible');
}


/*********************************
*********System**Operations*******
**********************************/

/**Registers a new user in the system */
function Register(form) {
	let username = form.elements["username"].value;
	let password = form.elements["password"].value;
	let firstName = form.elements["firstName"].value;
	let lastName = form.elements["lastName"].value;
	let email = form.elements["email"].value;
	let birthdate = form.elements["birthdate"].value;
	let new_user = new User(username, password, firstName, lastName, email, birthdate);
	users.push(new_user);

	switchScreen("#loginScreen");
}

/**Login for a valid user*/
function Login() {
	let login_username = document.getElementById("loginForm").elements.namedItem("username").value;
	let login_password = document.getElementById("loginForm").elements.namedItem("password").value;

	/**Checks if the user exists in the system */
	if (login_username != "") {
		for (let i = 0; i < users.length; i++) {
			if (login_username == users[i].username && login_password == users[i].password) {
				loginUser = login_username;
				switchScreen("#settingsScreen");
				return true;
			}
		}
	}
	alert("The username or password is incorrect. Please try again.");
}


/*********************************
***********Settings***************
**********************************/

/**Sets the game settings according to the given form that was submitted by the user. */
function setSettings(form) {
	let foodColor = new Array(3);
	let foodRemain = form.elements["numberOfBalls"].value;
	let monstersNumber = form.elements["numberOfMonsters"].value;
	let gameLength = form.elements["gameLength"].value;
	foodColor[0] = form.elements["smallBall"].value;
	foodColor[1] = form.elements["mediumBall"].value;
	foodColor[2] = form.elements["bigBall"].value;

	updateGamesSettings(foodRemain, gameLength, monstersNumber, foodColor);
}

/**Updates the Current Game Settings - at the menu bar and at the game*/
function updateGamesSettings(foodRemain, gameLength, monstersNumber, foodColor) {

	setGameSettings(foodRemain, gameLength, monstersNumber, foodColor);
	$("#upKeyLabel").text($("#upKey").val());
	$("#downKeyLabel").text($("#downKey").val());
	$("#leftKeyLable").text($("#leftkey").val());
	$("#rightKeyLabel").text($("#rightkey").val());
	$("#ballsLabel").text(foodRemain);
	$("#monstersLabel").text(monstersNumber);
	$("#lengthLabel").text(gameLength);
	$("#smallPointLabel").css("background-color", foodColor[0]);
	$("#mediumPointLabel").css("background-color", foodColor[1]);
	$("#bigPointLabel").css("background-color", foodColor[2]);
}

/**sets random settings values*/
function randomizeSettings() {
	let foodColor = new Array(3);
	let gameKeys = new Array(4);
	let foodRemain = Math.floor(Math.random() * 41) + 50; // minimum 50, maximum 90
	let monstersNumber = Math.floor(Math.random() * 4) + 1; // minimum 1 maximum 4
	let gameLength = Math.floor(Math.random() * 100) + 60; // minimum 60 seconds
	foodColor[0] = getRandomColor();
	foodColor[1] = getRandomColor();
	foodColor[2] = getRandomColor();

	//default game keys
	gameKeys[0] = 38;
	gameKeys[1] = 40;
	gameKeys[2] = 37;
	gameKeys[3] = 39;

	setsGameKeys(gameKeys);
	updateGamesSettings(foodRemain, gameLength, monstersNumber, foodColor);
}

/**Calculates random color code */
function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
