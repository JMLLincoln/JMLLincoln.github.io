function hide(id) {
	
	document.getElementById(id).style.display = "none";
}
function show(id) {
	
	document.getElementById(id).style.display = "inline-block";
}

function startGame(fps) {
	
	init();
	hide("form");
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

	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	scoreLabel = document.getElementById("score-label");
	hiscoreLabel = document.getElementById("hiscore-label");
	
	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased);
	
	hiscore = 0;
}

function init() {
	playerX = canvas.width / 2;
	playerY = 50;
	playerWidth = 35;
	playerHeight = 35;
	
	movespeed = 13;
	velX = 0;
	velY = 0;
	
	friction = 0.6;
	gravity = 0.5;
	grounded = false;
	
	moveRight = false;
	moveLeft = false;
	moveDown = false;
	moveUp = false;
	
	score = 0;
	
	platforms = [];
	gapWidth = 130;
	platformHeight = 40;
	platformSpeed = 8;
	distBetweenPlats = 55;
}

function createLayer() {
	
	buffer = 100;
	gapCenter = Math.random() * canvas.width
	
	if (gapCenter < buffer) {
		gapCenter = buffer;
	} else if (gapCenter > canvas.width - buffer) {
		gapCenter = canvas.width - buffer;
	}
	
	platforms.push({
			x : -5,
			y : canvas.height,
			w : gapCenter - (gapWidth / 2),
			h : platformHeight
		}
	);
	platforms.push({
			x : gapCenter + (gapWidth / 2),
			y : canvas.height,
			w : canvas.width - gapCenter,
			h : platformHeight
		}
	);
}

function update() {

	for (i = 0; i < platforms.length; i++) {
		platforms[i].y -= platformSpeed;
		if (platforms[i].y < -platformHeight / 2) {
			platforms.splice(i, 1);
			i -= 1;
		}
	}
	
	score += 1;
	scoreLabel.innerHTML = "SCORE: " + score;
	
	if (score % distBetweenPlats == 0) {
		createLayer();
	}
	
	if (playerY <= 0) {
		stopGame();
	} else if (playerY >= canvas.height) {
		playerY = canvas.height;
	}
	
	if (playerX <= playerWidth / 2) {
		playerX = (playerWidth / 2);
	} else if (playerX >= canvas.width - (playerWidth / 2)) {
		playerX = canvas.width - (playerWidth / 2);
	}
	
	if (moveRight) {
		playerX += movespeed;
	} else if (moveLeft) {
		playerX -= movespeed;
	}
	
	playerX += velX;
	playerY += velY;
	
	if (grounded) {
		velX *= friction;
	} else {
		velY += gravity;
	}
	
	if (velY > 10) {
		velY = 10;
	}
	
	grounded = false;
	
	for (i = 0; i < platforms.length; i++) {
		if (playerX > platforms[i].x && 
			playerX < platforms[i].x + platforms[i].w && 
			playerY > platforms[i].y && 
			playerY < platforms[i].y + platforms[i].h) {
				
			playerY = platforms[i].y;
			grounded = true;
		}
	}
	
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = '#FFF';
	ctx.fillRect(playerX - (playerWidth  / 2),
				 playerY - playerHeight, 
				 playerWidth, playerHeight);
				 
	for (i = 0; i < platforms.length; i++) {
		ctx.fillRect(platforms[i].x, platforms[i].y, platforms[i].w, platforms[i].h)
	}
}

function keyPressed(evt) {

	key = evt.keyCode;
	
	// Left || A
	if (key == 37 || key == 65) {
		moveLeft = true;
	} 
	
	// Up || W
	else if (key == 38 || key == 87) {
		moveUp = true;
	}
	
	// Right || D
	else if (key == 39 || key == 68) {
		moveRight = true;
	}
	
	// Down || S
	else if (key == 40 || key == 83) {
		moveDown = true;
	}
}

function keyReleased(evt) {

	key = evt.keyCode;
	
	// Left || A
	if (key == 37 || key == 65) {
		moveLeft = false;
	} 
	
	// Up || W
	else if (key == 38 || key == 87) {
		moveUp = false;
	}
	
	// Right || D
	else if (key == 39 || key == 68) {
		moveRight = false;
	}
	
	// Down || S
	else if (key == 40 || key == 83) {
		moveDown = false;
	}
}