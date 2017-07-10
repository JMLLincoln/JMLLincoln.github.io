function hide(id) {
	
	document.getElementById(id).style.display = "none";
}
function show(id) {
	
	document.getElementById(id).style.display = "inline-block";
}

function startGame(fps) {
	
	hide("form");
	init();
	updateFunction = setInterval(updateMain, 1000 / fps);
}

function stopGame() {
	
	score = Math.floor(score);
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
	offsetLeft = canvas.offsetLeft;
	offsetTop = canvas.offsetTop;
	ctx = canvas.getContext("2d");
	
	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased);
	canvas.addEventListener("mousemove", trackMouse);
}

function init() {
	
	playerX = canvas.width / 2;
	playerY = canvas.height / 2;
	playerWidth = 30;
	playerHeight = 30;
	
	maximumHealth = 1000;
	currentHealth = 1000;
	healthbarW = 300;
	healthbarH = 50;
	healthbarY = canvas.width - 70;
	healthbarX = 20;
		
	playerVelX = 0;
	playerVelY = 0;
	playerSpeed = 8;
	friction = 0.9;
	
	moveRight = false;
	moveLeft = false;
	moveDown = false;
	moveUp = false;
	
	bullets = [];
	shootSpeed = 40;
	shootCooldown = 10;
	bulletSpeed = 10;
	mousePosX = 0;
	mousePosY = 0;
	
	score = 0;
	hiscore = 0;
	
	circle = Math.PI * 2;
	enemies = [];	
	// Size, Movespeed, Turnrate, Damage, Health, Bounty
	enemyTypes = [
		[10, 8, 60, 3, 5, 10],
		[20, 7, 50, 5, 10, 20],
		[30, 6, 35, 8, 10, 20],
		[40, 5, 20, 10, 15, 20],
		[50, 4, 5, 15, 20, 40]
	];
	spawnPoints = [
		{x : 50, y: 50}, 
		{x : 50, y: canvas.height - 50},
		{x : canvas.width - 50, y: 50},
		{x : canvas.width - 50, y: canvas.height - 50}
	];
	
	toClean = [];
}

function createBullet() {
	
	x = mousePosX - playerX;
	y = mousePosY - playerY;
	
	angle = Math.atan2(y, x);
	
	bullets.push({
			posX : playerX,
			posY : playerY,
			velX : Math.cos(angle) * bulletSpeed,
			velY : Math.sin(angle) * bulletSpeed,
			size : 12,
			damage : 10
		}
	);
}

function createEnemy(esize, espeed, eturn, edmg, ehp, ebounty) {
	
	spawnIndex = Math.floor(Math.random() * 4);
	rndOrientation = Math.floor(Math.random() * 360);
	
	enemies.push({
			posX : spawnPoints[spawnIndex].x,
			posY : spawnPoints[spawnIndex].y,
			size : esize,
			velocity : espeed,
			turnrate : circle / eturn,
			orientation : rndOrientation,
			damage : edmg,
			health : ehp,
			bounty : ebounty
		}
	);
}

function updateMain() {

	score += 0.02;
	scoreLabel.innerHTML = "SCORE: " + Math.floor(score);
	
	updatePlayer();
	updateBullets();
	updateEnemies();
	updateCleanup();
	updateScreen();
}

function updatePlayer() {
	
	if (currentHealth <= 0) {
		currentHealth = 0;
		stopGame();
	}
	
	shootCooldown -= 1;
	if (shootCooldown == 0) {
		createBullet();
		shootCooldown = shootSpeed;
	}
	
	if (moveRight) {
		playerVelX = playerSpeed;
	} else if (moveLeft) {
		playerVelX = -playerSpeed;
	} else {
		playerVelX *= friction;
	}
	
	if (moveDown) {
		playerVelY = playerSpeed;
	} else if (moveUp) {
		playerVelY = -playerSpeed;
	} else {
		playerVelY *= friction;
	}
	
	playerX += playerVelX;
	playerY += playerVelY;
	
	if (playerX <= playerWidth / 2) {
		playerX = (playerWidth / 2);
	} else if (playerX >= canvas.width - (playerWidth / 2)) {
		playerX = canvas.width - (playerWidth / 2);
	}
	
	if (playerY <= playerHeight / 2) {
		playerY = (playerHeight / 2);
	} else if (playerY >= canvas.height - (playerHeight / 2)) {
		playerY = canvas.height - (playerHeight / 2);
	}
}

function updateBullets() {
	
	for (i = 0; i < bullets.length; i++) {	
		
		bullets[i].posX += bullets[i].velX;
		bullets[i].posY += bullets[i].velY;
		
		if (bullets[i].posX < 0 ||
			bullets[i].posY < 0 ||
			bullets[i].posX > canvas.width ||
			bullets[i].posY > canvas.height) {
				toClean.push(["bullet", i]);
		}
	}
}

function updateEnemies() {
	
	if (enemies.length < 20) {
		rnd = Math.floor(Math.random() * 5);
		etyp = enemyTypes[rnd];
		createEnemy(etyp[0], etyp[1], etyp[2], etyp[3], etyp[4], etyp[5]);
	}
	
	for (i = 0; i < enemies.length; i++) {	
		for (j = 0; j < bullets.length; j++) {
			if (bullets[j].posX + (bullets[j].size / 2) > enemies[i].posX - (enemies[i].size / 2) && 
				bullets[j].posX - (bullets[j].size / 2) < enemies[i].posX + (enemies[i].size / 2) && 
				bullets[j].posY + (bullets[j].size / 2) > enemies[i].posY - (enemies[i].size / 2) && 
				bullets[j].posY - (bullets[j].size / 2) < enemies[i].posY + (enemies[i].size / 2)) {
					
				enemies[i].health -= bullets[j].damage;
				if (enemies[i].health >= 0 || bullets[j].damage <= 0) {
					toClean.push(["bullet", j]);
				} else {
					bullets[j].damage -= Math.abs(enemies[i].health);
				}
			}
		}
		
		if (enemies[i].health <= 0) {
			score += enemies[i].bounty;
			toClean.push(["enemy", i]);
			continue;
		}
		
		if (playerX + (playerWidth / 2) > enemies[i].posX - (enemies[i].size / 2) && 
			playerX - (playerWidth / 2) < enemies[i].posX + (enemies[i].size / 2) && 
			playerY + (playerHeight / 2) > enemies[i].posY - (enemies[i].size / 2) && 
			playerY - (playerHeight / 2) < enemies[i].posY + (enemies[i].size / 2)) {
			
			currentHealth -= enemies[i].damage;
			toClean.push(["enemy", i]);
		}
		
		x = playerX - enemies[i].posX;
		y = playerY - enemies[i].posY;
		distance = Math.pow(x, 2) + Math.pow(y, 2);
		
		if (distance < 600) {
			continue;
		} else {
			
			angle = Math.atan2(y, x);
			delta = angle - enemies[i].orientation;
			abs = Math.abs(delta);
			
			if (abs > Math.PI) {
				delta = abs - circle;
			}
			
			if (delta !== 0) {
				direction = delta / abs;
				enemies[i].orientation += (direction * Math.min(enemies[i].turnrate, abs));
			}
			
			enemies[i].orientation %= circle;
			
			enemies[i].posX += Math.cos(enemies[i].orientation) * enemies[i].velocity;
			enemies[i].posY += Math.sin(enemies[i].orientation) * enemies[i].velocity;
		}
	}
}

function updateCleanup() {
	
	swapped = true;
	while (swapped) {
		swapped = false;
		for (i = 0; i < toClean.length - 1; i++) {
			if (toClean[i][1] < toClean[i + 1][1]) {
				temp = toClean[i];
				toClean[i] = toClean[i + 1];
				toClean[i + 1] = temp;
				swapped = true;
			}
		}
	}
	
	for (i = 0; i < toClean.length; i++) {	
		if (toClean[i][0] == "enemy") {
			enemies.splice(toClean[i][1], 1);
		} else if (toClean[i][0] == "bullet") {
			bullets.splice(toClean[i][1], 1);
		}
	}
	
	toClean = [];
}

function updateScreen() {
	
    ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = '#FFF';
	ctx.fillRect(playerX - (playerWidth  / 2),
				 playerY - (playerHeight / 2),
				 playerWidth, playerHeight
	);
	
	for (i = 0; i < bullets.length; i++) {
		ctx.fillRect(bullets[i].posX - (bullets[i].size / 2), 
					 bullets[i].posY - (bullets[i].size / 2), 
					 bullets[i].size, bullets[i].size
		);
	}
	
	ctx.strokeStyle = '#FFF';
	for (i = 0; i < enemies.length; i++) {
		ctx.strokeRect(enemies[i].posX - (enemies[i].size / 2), 
					   enemies[i].posY - (enemies[i].size / 2), 
					   enemies[i].size, enemies[i].size
		);
	}
	
	ctx.strokeRect(healthbarX, healthbarY,
				   healthbarW, healthbarH
	);
	
	ctx.fillStyle = '#9fe3b1';
	percMissing =  currentHealth / maximumHealth;
	newWidth = Math.floor(healthbarW * percMissing);
	ctx.fillRect(healthbarX, healthbarY,
				 newWidth, healthbarH
	);
}

function trackMouse(evt) {
	
	mousePosX = (evt.clientX - offsetLeft) * 2;
	mousePosY = (evt.clientY - offsetTop - 10) * 2;
}

function keyPressed(evt) {

	key = evt.keyCode;
	if (key == 37 || key == 65) {
		moveLeft = true;
	} else if (key == 38 || key == 87) {
		moveUp = true;
	} else if (key == 39 || key == 68) {
		moveRight = true;
	} else if (key == 40 || key == 83) {
		moveDown = true;
	}
}

function keyReleased(evt) {

	key = evt.keyCode;
	if (key == 37 || key == 65) {
		moveLeft = false;
	} else if (key == 38 || key == 87) {
		moveUp = false;
	} else if (key == 39 || key == 68) {
		moveRight = false;
	} else if (key == 40 || key == 83) {
		moveDown = false;
	}
}