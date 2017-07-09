function hide(id) {
	
	document.getElementById(id).style.display = "none";
}
function show(id) {
	
	document.getElementById(id).style.display = "inline-block";
}

function startGame(fps) {
	
	hide("form");
	init();
	updateFunction = setInterval(update, 1000 / fps);
}

function stopGame() {
	
	if (score > hiscore) {
		hiscore = score;
		hiscoreLabel.innerHTML = "HISCORE: " + hiscore;
	}
	
	show("form");
	clearInterval(updateFunction);
}

window.onload = function() {
	
	scoreLabel = document.getElementById("score");
	hiscoreLabel = document.getElementById("hiscore");
	
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased);
}

function init() {
	
	playerX = canvas.width / 2;
	playerY = canvas.height - 80;
	playerWidth = 100;
	playerHeight = 20;
	
	velX = 0;
	movespeed = 6;
	friction = 0.8;
	
	moveRight = false;
	moveLeft = false;

	ballSize = 25;
	ballX = canvas.width / 2;
	ballY = canvas.height - 80 - (ballSize / 2) - (playerHeight / 2);
	
	ballMinVel = 6;
	ballVelX = -ballMinVel;
	ballVelY = -ballMinVel;
	
	blocks = [];
	blockWidth = 100;
	blockHeight = 30;
	
	toClean = [];
	
	score = 0;
	hiscore = 0;
	
	colours = [
		"#8080FF",
		"#80FF80",
		"#FF8080",
		"#FFBF80"
	];
	
	for (i = 0; i < 10; i++) {
		y = (i + 1) * blockHeight + (i * 40);
		for (j = 0; j < 13; j++) {
			x = (j + 1) * blockWidth + (j * 18);
			createBlock(x, y);
		}
	}
}

function createBlock(x, y) {
	
	rnd = Math.floor(Math.random() * 4);
		
	blocks.push({
			posX : x,
			posY : y,
			width : blockWidth,
			height : blockHeight,
			colour : colours[rnd]
		}
	);
}

function update() {

	scoreLabel.innerHTML = "SCORE: " + score;
	
	updatePlayer();
	updateBall();
	updateCleanup();
	updateScreen();
}

function updatePlayer() {
	
	if (moveRight) {
		velX = movespeed;
	} else if (moveLeft) {
		velX = -movespeed;
	} else {
		velX *= friction;
	}
	
	playerX += velX;
	
	if (playerX <= playerWidth / 2) {
		playerX = (playerWidth / 2);
	} else if (playerX >= canvas.width - (playerWidth / 2)) {
		playerX = canvas.width - (playerWidth / 2);
	}
}

function updateBall() {
	
	if (ballX <= ballSize / 2) {
		ballX = (ballSize / 2);
		ballVelX = -ballVelX;
	} else if (ballX >= canvas.width - (ballSize / 2)) {
		ballX = canvas.width - (ballSize / 2);
		ballVelX = -ballVelX;
	}
	
	if (ballY <= ballSize / 2) {
		ballY = (ballSize / 2);
		ballVelY = -ballVelY;
	} else if (ballY >= canvas.height + ballSize) {
		stopGame();
	}
	
	wMod = (playerWidth / 2)
	hMod = (playerHeight / 2)
	
	if (ballX > playerX - wMod && 
		ballX < playerX - (wMod / 2) && 
		ballY > playerY - hMod && 
		ballY < playerY + hMod) {
			
		ballVelY = -ballVelY;
		if (ballVelX < ballMinVel) {
			ballVelX -= 2;
		} else {
			ballVelX = -ballMinVel;
		}
		
	} else if (ballX > playerX + (wMod / 2) && 
		ballX < playerX + wMod && 
		ballY > playerY - hMod && 
		ballY < playerY + hMod) {
			
		ballVelY = -ballVelY;
		if (ballVelX < ballMinVel) {
			ballVelX += 2;
		} else {
			ballVelX = ballMinVel;
		}
		
	} else if (ballX > playerX - (wMod / 2) && 
		ballX < playerX + (wMod / 2) && 
		ballY > playerY - hMod && 
		ballY < playerY + hMod) {	
		
		ballVelY = -ballVelY;
		ballVelX = ballMinVel;
	}
	
	for (i = 0; i < blocks.length; i++) {
		if (ballX > blocks[i].posX - (blocks[i].width / 2) && 
			ballX < blocks[i].posX + (blocks[i].width / 2) && 
			ballY > blocks[i].posY -  (blocks[i].height / 2) && 
			ballY < blocks[i].posY + (blocks[i].height / 2)) {
				
			ballVelY = -ballVelY;
			toClean.push(i);
			score += 50;
		}
	}
	
	ballX += ballVelX;
	ballY += ballVelY;
}

function updateCleanup() {

	for (i = 0; i < toClean.length; i++) {
		blocks.splice(toClean[i], 1);
	}
	toClean = [];
}

function updateScreen() {
	
    ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = '#FFF';
	ctx.fillRect(playerX - (playerWidth  / 2),
				 playerY - (playerHeight / 2),
				 playerWidth, playerHeight);
				 
	ctx.fillRect(ballX - (ballSize  / 2),
				 ballY - (ballSize / 2),
				 ballSize, ballSize);
				 
	ctx.strokeStyle = '#000';
	for (i = 0; i < blocks.length; i++) {
		
		ctx.fillStyle = blocks[i].colour;
		
		ctx.fillRect(blocks[i].posX - (blocks[i].width / 2), 
					 blocks[i].posY - (blocks[i].height / 2), 
					 blocks[i].width, blocks[i].height);
					 
		ctx.strokeRect(blocks[i].posX - (blocks[i].width / 2), 
					 blocks[i].posY - (blocks[i].height / 2), 
					 blocks[i].width, blocks[i].height);
	}
}

function keyPressed(evt) {

	key = evt.keyCode;
	if (key == 37 || key == 65) {
		moveLeft = true;
	} else if (key == 39 || key == 68) {
		moveRight = true;
	}
}

function keyReleased(evt) {

	key = evt.keyCode;
	if (key == 37 || key == 65) {
		moveLeft = false;
	} else if (key == 39 || key == 68) {
		moveRight = false;
	}
}