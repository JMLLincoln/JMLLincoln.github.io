function hide(id) {
	document.getElementById(id).style.display = "none";
}
function show(id) {
	document.getElementById(id).style.display = "inline-block";
}

function startGame(fps) {
	
	n = document.getElementById('numocards').value;
	if (n <= 18 && n % 2 == 0) {
		init(n);
		hide("form");
		updateFunction = setInterval(update, 1000 / fps);
	} else {
		document.getElementById('nocLabel').innerHTML = "Invalid input! Enter an even number 18 or below and 6 or above.";
	}

}

function stopGame() {
	if (pscore + bscore == totalCards){
		if (pscore > bscore) {
			setText("All cards collected.", "You win!");
		} else if (bscore > pscore) {
			setText("All cards collected.", "I win!");
		} else {
			setText("All cards collected.", "It's a draw!");
		}
	} else {
		setText("Game reset.", "Play again?");
	}
	
	show("form");
	clearInterval(updateFunction);
}

window.onload = function() {

	info0Label = document.getElementById('info0');
	info1Label = document.getElementById('info1');
	pscoreLabel = document.getElementById('pscore');
	bscoreLabel = document.getElementById('bscore');
	canvas = document.getElementById('canvas');
}

function init(n) {
	
	turn = 'player';
	
	totalCards = n;	
	canvas.innerHTML = "";
	canvas.innerHTML += "<ul class='row'>";
	for (i = 0; i < totalCards; i++) {
		id = "'index" + i + "'";
		console.log(id);
		canvas.innerHTML += "<li id=" + id + " class='slot' onclick='clickCard(this)'><div class='card back'></div></li>";
	}
	canvas.innerHTML += "</ul>";
	
	colours = [
		'blue', 'blue', 
		'green', 'green', 
		'red', 'red', 
		'orange', 'orange',
		'yellow', 'yellow',
		'cyan', 'cyan',
		'purple', 'purple',
		'pink', 'pink',
		'turquoise', 'turquoise'
	];
	
	if (colours.length > totalCards) {
		x = colours.length - totalCards;
		colours.splice(totalCards, x);
	}
	
	cards = [];
	for (i = 0; i < totalCards; i++) {
		x = Math.floor(Math.random() * colours.length);
		cards.push(colours[x]);
		colours.splice(x, 1);
		
		id = "index" + i;
		document.getElementById(id).innerHTML = "<div class='card back'></div>"; 
	}
	
	selection = [];
	
	pscore = 0;
	bscore = 0;
}

function clickCard(ele, bypass = false) {
	
	x = ele.id.replace(/\D/g,'');
	
	if (selection[0] == x) {
		present = true;
	} else {
		present = false;
	}
	
	if ((turn == 'player' || bypass) && cards[x] != null && !present) {
		ele.innerHTML = "<div class='card " + cards[x] + "'></div>";
		selection.push(x);
	}
}


function switchTurns(card1, card2, who) {
	
	setTimeout(
		function() { 
			if (card1 != null) {
				document.getElementById(card1).innerHTML = "<div class='card back'></div>"; 
				document.getElementById(card2).innerHTML = "<div class='card back'></div>";
			}
			turn = who;
		}, 3000
	);
}

function setText(t1, t2) {
	
	info0Label.innerHTML = t1;
	info1Label.innerHTML = t2;
}

function botTurn() {
	
	prevX = -1;
	while (selection.length < 2) {
		x = Math.floor(Math.random() * cards.length);
		if (prevX != x && cards[x] != null) {
			prevX = x;
			clickCard(document.getElementById("index" + x), true);
		}
	}
}

function update() {
	
	pscoreLabel.innerHTML = "You have " + pscore + " cards!";
	bscoreLabel.innerHTML = "I have " + bscore + " cards!";
		
	for (i = 0; i < cards.length; i++) {
		if (cards[i] != null) {
			break
		} else if (i == 7) {
			stopGame();
		}
	}
	
	if (turn == 'player') {
		setText("It's your turn!", "Select two cards.");
	} else if (turn == 'bot') {
		setText("It's my turn!", "I choose these two.");
		botTurn();
	}
	
    if (selection.length == 2) {
		i = selection[0];
		j = selection[1];
		selection = []
		
		if (turn == 'player') {
			newTurn = 'bot';
		} else if (turn == 'bot') {
			newTurn = 'player';
		} 
		
		if (cards[i] == cards[j]) {
			if (turn == 'player') {
				setText("It's a match!", "You score 2 points.")
				pscore += 2;
			} else if (turn == 'bot') {
				setText("It's a match!", "I score 2 points.")
				bscore += 2;
			} 
			
			cards[i] = null;
			cards[j] = null;
			
			newTurn = turn;
			switchTurns(null, null, newTurn);
		} else {
			setText("No match.", "Let's keep going!")
			switchTurns("index" + i, "index" + j, newTurn);
		}
		
		turn = "";
	}
}