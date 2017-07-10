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
	document.getElementById("overlay").addEventListener("mousemove", trackMouse);
}

function init() {
	
	playerX = canvas.width / 2;
	playerY = canvas.height / 2;
	playerWidth = 50;
	playerHeight = 50;
	
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
	firerate = 40;
	shotCooldown = 10;
	bulletSpeed = 10;
	shoot = true;
	mousePosX = 0;
	mousePosY = 0;
	
	score = 0;
	hiscore = 0;
	
	circle = Math.PI * 2;
	enemies = [];	
	// Size, Movespeed, Turnrate, Damage, Health, Bounty, Firerate, Type, BulletSize
	enemyTypes = [
		[15,      7,       60,     10,      5,      2,      0,     "runner",   0],
		[25,      2,       50,     14,     10,     15,     20,     "shooter",  9],
		[30,      1,       35,     18,     10,     20,     50,     "shooter", 13],
		[40,      1,       20,     24,     10,     20,     70,     "shooter", 20],
		[60,      0,        5,     25,     20,     40,    170,     "spawner",  0]
	];
	spawnPoints = [
		{x : 50, y: 50}, 
		{x : 50, y: canvas.height - 50},
		{x : canvas.width - 50, y: 50},
		{x : canvas.width - 50, y: canvas.height - 50}
	];
	
	currentRoom = {};
	horzDoorHeight = vertDoorWidth = 80;
	horzDoorWidth = vertDoorHeight = 120;
	leftLimit = 0;
	rightLimit = 0;
	topLimit = 0;
	bottomLimit = 0;
	createRoom(true, true, true, false, 0, "left");
	
	toClean = [];
}

function createBullet(bshooter, originX, originY, targetX, targetY, bsize, bdmg) {
	
	x = targetX - originX;
	y = targetY - originY;
	
	angle = Math.atan2(y, x);
	
	bullets.push({
			posX : originX,
			posY : originY,
			velX : Math.cos(angle) * bulletSpeed,
			velY : Math.sin(angle) * bulletSpeed,
			size : bsize,
			damage : bdmg,
			shooter : bshooter
		}
	);
}

// Size, Speed, Turnrate, Damage, Hitpoints, Bounty, Firerate, Type, PosX, PosY, BulSize
function createEnemy(esze, espd, eturn, edmg, ehp, ebon, efrt, etyp, epx, epy, ebs) {
	
	rndOrientation = Math.floor(Math.random() * 360);
	
	enemies.push({
			posX : epx,
			posY : epy,
			size : esze,
			velocity : espd,
			turnrate : circle / eturn,
			orientation : rndOrientation,
			damage : edmg,
			health : ehp,
			bounty : ebon,
			type : etyp,
			shotCooldown : efrt,
			firerate : efrt,
			bulletSize : ebs
		}
	);
}

function createRoom(td, rd, bd, ld, noe, spos) {
	
	currentRoom = {
		width : 1200,
		height : 1200,
		doors : {
			top : td,
			right : rd,
			bottom : bd,
			left : ld
		},
		roomComplete : false
	};
	
	initialiseRoom(noe, spos);
}

function initialiseRoom(noe, spos) {
	
	leftLimit = (canvas.width / 2) - (currentRoom.width / 2) + (playerWidth / 2);
	rightLimit = (canvas.width / 2) + (currentRoom.width / 2) - (playerWidth / 2);
	topLimit = (canvas.height / 2) - (currentRoom.height / 2) + (playerHeight / 2);
	bottomLimit = (canvas.height / 2) + (currentRoom.height / 2) - (playerHeight / 2);
	
	if (noe <= 0) {
		shoot = false;
	} else {
		shoot = true;
	}
	
	if (spos == "top") {
		playerX = canvas.width / 2;
		playerY = 300;
	} else if (spos == "right") {
		playerX = canvas.width - 300;
		playerY = canvas.height / 2;
	} else if (spos == "bottom") {
		playerX = canvas.width / 2;
		playerY = canvas.height - 300;
	} else if (spos == "left") {
		playerX = 300;
		playerY = canvas.height / 2;
	}
	
	while (enemies.length < noe) {
		rnd = Math.floor(Math.random() * 4) + 1;
		e = enemyTypes[rnd];
		
		//spawnIndex = Math.floor(Math.random() * spawnPoints.length);
		//sPX = spawnPoints[spawnIndex].x;
		//sPY = spawnPoints[spawnIndex].y;
		
		limitX = canvas.width - 1200;
		limitY = canvas.height - 1200;
		debugger;
		sPX = Math.floor(Math.random() * (1200 - limitX)) + limitX;
		sPY = Math.floor(Math.random() * (1200 - limitY)) + limitY;
		
		createEnemy(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], sPX, sPY, e[8]);
	}
}

function updateMain() {

	scoreLabel.innerHTML = "SCORE: " + Math.floor(score);
	
	updatePlayer();
	updateBullets();
	updateEnemies();
	updateRoom();
	updateCleanup();
	updateScreen();
}

function updatePlayer() {
	
	for (i = 0; i < bullets.length; i++) {
		if (bullets[i].shooter == "enemy" &&
			bullets[i].posX - (bullets[i].size / 2) < playerX + (playerWidth / 2) && 
			bullets[i].posX + (bullets[i].size / 2) > playerX - (playerWidth / 2) && 
			bullets[i].posY - (bullets[i].size / 2) < playerY + (playerHeight / 2) && 
			bullets[i].posY + (bullets[i].size / 2) > playerY - (playerHeight / 2)) {
				
			currentHealth -= bullets[i].damage;
			toClean.push(["bullet", i]);
		}
	}
		
	if (currentHealth <= 0) {
		currentHealth = 0;
		stopGame();
	}
	
	shotCooldown -= 1;
	if (shotCooldown <= 0 && shoot) {
		createBullet("player", 
					 playerX, playerY, 
					 mousePosX, mousePosY,
					 14, 10
		);
		
		shotCooldown = firerate;
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
		
	if (playerX <= leftLimit) {
		playerX = leftLimit;
	} else if (playerX >= rightLimit) {
		playerX = rightLimit;
	}
	
	if (playerY <= topLimit) {
		playerY = topLimit;
	} else if (playerY >= bottomLimit) {
		playerY = bottomLimit;
	}
}

function updateBullets() {
	
	for (i = 0; i < bullets.length; i++) {	
		
		bullets[i].posX += bullets[i].velX;
		bullets[i].posY += bullets[i].velY;
		
		if (bullets[i].posX < leftLimit - (playerWidth / 2) ||
			bullets[i].posY < topLimit - (playerHeight / 2)  ||
			bullets[i].posX > rightLimit + (playerWidth / 2)  ||
			bullets[i].posY > bottomLimit + (playerHeight / 2) ) {
				toClean.push(["bullet", i]);
		}
	}
}

function adjustOri(x, y, or, tr) {
	
	angle = Math.atan2(y, x);
	delta = angle - or;
	abs = Math.abs(delta);
	
	if (abs > Math.PI) {
		delta = abs - circle;
	}
	
	if (delta !== 0) {
		direction = delta / abs;
		or += (direction * Math.min(tr, abs));
	}
	
	or %= circle;
	return or;
}

function updateEnemies() {
		
	for (i = 0; i < enemies.length; i++) {	
		for (j = 0; j < bullets.length; j++) {
			if (bullets[j].shooter == "player" &&
				bullets[j].posX + (bullets[j].size / 2) > enemies[i].posX - (enemies[i].size / 2) && 
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
			enemies[i].health -= 5;
		}
		
		if (enemies[i].health <= 0) {
			score += enemies[i].bounty;
			toClean.push(["enemy", i]);
			continue;
		}
		
		enemies[i].shotCooldown -= 1;
		if (enemies[i].shotCooldown == 0) {
			
			if (enemies[i].type == "shooter") {
				createBullet("enemy", 
							 enemies[i].posX, enemies[i].posY, 
							 playerX, playerY,
							 enemies[i].bulletSize,
							 enemies[i].damage
				);
			} else if (enemies[i].type == "spawner") {
				e = enemyTypes[0];
				createEnemy(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7],
							enemies[i].posX, enemies[i].posY);
				createEnemy(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7],
							enemies[i].posX, enemies[i].posY);
			}
			
			enemies[i].shotCooldown = enemies[i].firerate;
		}
		
		targetX = playerX - enemies[i].posX;
		targetY = playerY - enemies[i].posY;
		distance = Math.pow(targetX, 2) + Math.pow(targetY, 2);
		
		
		if (enemies[i].type != "runner" && distance < 20000) {
			enemies[i].orientation = adjustOri(targetX, targetY, 
											   enemies[i].orientation, 
											   enemies[i].turnrate);
			continue;
		} else {
			
			enemies[i].orientation = adjustOri(targetX, targetY, 
											   enemies[i].orientation, 
											   enemies[i].turnrate);
													   
			enemies[i].posX += Math.cos(enemies[i].orientation) * enemies[i].velocity;
			enemies[i].posY += Math.sin(enemies[i].orientation) * enemies[i].velocity;
			
			if (enemies[i].posX <= leftLimit) {
				enemies[i].posX = leftLimit;
			} else if (enemies[i].posX >= rightLimit) {
				enemies[i].posX = rightLimit;
			}
			
			if (enemies[i].posY <= topLimit) {
				enemies[i].posY = topLimit;
			} else if (enemies[i].posY >= bottomLimit) {
				enemies[i].posY = bottomLimit;
			}
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

// Don't even bother looking at this ugly code
// Functionality now, optimisation later ;)
function updateRoom() {
	
	if (!currentRoom.complete) {
		if (enemies.length == 0) {
			currentRoom.complete = true;
			shoot = false;
		} 
	} else if (currentRoom.doors.top == true &&
			   playerX - (playerWidth / 2) > (canvas.width / 2) - (horzDoorWidth / 2) && 
			   playerX + (playerWidth / 2) < (canvas.width / 2) + (horzDoorWidth / 2) && 
			   playerY - (playerHeight / 2) < (canvas.height / 2) - (currentRoom.height / 2) + horzDoorHeight) {
		
		numOfEnemies = Math.floor(Math.random() * 10);
		doorsPresent = Math.floor((Math.random() * 3) + 1);
		doors = ["topDoor", "rightDoor", "leftDoor"];
		
		if (doorsPresent == 3) {
			topDoor = true;
			rightDoor = true;
			leftDoor = true;
			
		} else {
			topDoor = false;
			rightDoor = false;
			leftDoor = false;
			
			while (doorsPresent > 0) {
				rnd = Math.floor(Math.random() * 3);
				door = doors[rnd];
				eval(door + " = true");
				doorsPresent -= 1;
			}
		}
		
		createRoom(topDoor, rightDoor, 
				   false, leftDoor, 
				   numOfEnemies, "bottom");
		
	} else if (currentRoom.doors.right == true &&
			   playerY - (playerHeight / 2) > (canvas.height / 2) - (vertDoorHeight / 2) && 
			   playerY + (playerHeight / 2) < (canvas.height / 2) + (vertDoorHeight / 2) && 
			   playerX + (playerWidth / 2) > (canvas.width / 2) + (currentRoom.height / 2) - vertDoorWidth) {
		
		numOfEnemies = Math.floor(Math.random() * 10) + 4;
		doorsPresent = Math.floor((Math.random() * 3) + 1);
		doors = ["topDoor", "rightDoor", "botDoor"];
		
		if (doorsPresent == 3) {
			topDoor = true;
			rightDoor = true;
			botDoor = true;
			
		} else {
			topDoor = false;
			rightDoor = false;
			botDoor = false;
			
			while (doorsPresent > 0) {
				rnd = Math.floor(Math.random() * 3);
				door = doors[rnd];
				eval(door + " = true");
				doorsPresent -= 1;
			}
		}
		
		createRoom(topDoor, rightDoor, 
				   botDoor, false, 
				   numOfEnemies, "left");
		
	} else if (currentRoom.doors.bottom == true &&
			   playerX - (playerWidth / 2) > (canvas.width / 2) - (horzDoorWidth / 2) && 
			   playerX + (playerWidth / 2) < (canvas.width / 2) + (horzDoorWidth / 2) && 
			   playerY + (playerHeight / 2) > (canvas.height / 2) + (currentRoom.height / 2) - horzDoorHeight) {
		
		numOfEnemies = Math.floor(Math.random() * 10);
		doorsPresent = Math.floor((Math.random() * 3) + 1);
		doors = ["botDoor", "rightDoor", "leftDoor"];
		
		if (doorsPresent == 3) {
			botDoor = true;
			rightDoor = true;
			leftDoor = true;
			
		} else {
			botDoor = false;
			rightDoor = false;
			leftDoor = false;
			
			while (doorsPresent > 0) {
				rnd = Math.floor(Math.random() * 3);
				door = doors[rnd];
				eval(door + " = true");
				doorsPresent -= 1;
			}
		}
		
		createRoom(false, rightDoor, 
				   botDoor, leftDoor, 
				   numOfEnemies, "top");
		
	} else if (currentRoom.doors.left == true &&
			   playerY - (playerHeight / 2) > (canvas.height / 2) - (vertDoorHeight / 2) && 
			   playerY + (playerHeight / 2) < (canvas.height / 2) + (vertDoorHeight / 2) && 
			   playerX - (playerWidth / 2) < (canvas.width / 2) - (currentRoom.height / 2) + vertDoorWidth) {
		
		numOfEnemies = Math.floor(Math.random() * 10);
		doorsPresent = Math.floor((Math.random() * 3) + 1);
		doors = ["topDoor", "botDoor", "leftDoor"];
		
		if (doorsPresent == 3) {
			topDoor = true;
			botDoor = true;
			leftDoor = true;
			
		} else {
			topDoor = false;
			botDoor = false;
			leftDoor = false;
			
			while (doorsPresent > 0) {
				rnd = Math.floor(Math.random() * 3);
				door = doors[rnd];
				eval(door + " = true");
				doorsPresent -= 1;
			}
		}
		
		createRoom(topDoor, false, 
				   botDoor, leftDoor, 
				   numOfEnemies, "right");
	}
}

function updateScreen() {
	
    ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = '#999';
	ctx.fillRect((canvas.width / 2) - (currentRoom.width  / 2),
				 (canvas.height / 2) - (currentRoom.height  / 2),
				 currentRoom.width, currentRoom.height);
				 
	if (currentRoom.complete) {
		
		if (currentRoom.doors.top) {
			grd = ctx.createLinearGradient(
				(canvas.width / 2) - (horzDoorWidth / 2), 
				(canvas.height / 2) - (currentRoom.height / 2), 
				(canvas.width / 2) - (horzDoorWidth / 2), 
				(canvas.height / 2) - (currentRoom.height / 2) + horzDoorHeight
			);
				
			grd.addColorStop(0, '#EEE');
			grd.addColorStop(1, '#999');
			ctx.fillStyle = grd;
			
			ctx.fillRect((canvas.width / 2) - (horzDoorWidth / 2), 
						 (canvas.height / 2) - (currentRoom.height / 2), 
						 horzDoorWidth, horzDoorHeight);
		}
		if (currentRoom.doors.right) {
			grd = ctx.createLinearGradient(
				(canvas.width / 2) + (currentRoom.width / 2), 
				(canvas.height / 2) - (vertDoorHeight / 2), 
				(canvas.width / 2) + (currentRoom.width / 2) - vertDoorWidth, 
				(canvas.height / 2) - (vertDoorHeight / 2)
			);
				
			grd.addColorStop(0, '#EEE');
			grd.addColorStop(1, '#999');
			ctx.fillStyle = grd;
			
			ctx.fillRect((canvas.width / 2) + (currentRoom.width / 2) - vertDoorWidth,
						 (canvas.height / 2) - (vertDoorHeight / 2),
						 vertDoorWidth, vertDoorHeight);
		}
		if (currentRoom.doors.bottom) {
			grd = ctx.createLinearGradient(
				(canvas.width / 2) - (horzDoorWidth / 2), 
				(canvas.height / 2) + (currentRoom.height / 2), 
				(canvas.width / 2) - (horzDoorWidth / 2), 
				(canvas.height / 2) + (currentRoom.height / 2) - horzDoorHeight
			);
				
			grd.addColorStop(0, '#EEE');
			grd.addColorStop(1, '#999');
			ctx.fillStyle = grd;
			
			ctx.fillRect((canvas.width / 2) - (horzDoorWidth / 2),
						 (canvas.height / 2) + (currentRoom.height / 2) - horzDoorHeight,
						 horzDoorWidth, horzDoorHeight);
		}
		if (currentRoom.doors.left) {
			grd = ctx.createLinearGradient(
				(canvas.width / 2) - (currentRoom.width / 2), 
				(canvas.height / 2) - (vertDoorHeight / 2), 
				(canvas.width / 2) - (currentRoom.width / 2) + vertDoorWidth, 
				(canvas.height / 2) - (vertDoorHeight / 2)
			);
				
			grd.addColorStop(0, '#EEE');
			grd.addColorStop(1, '#999');
			ctx.fillStyle = grd;
			
			ctx.fillRect((canvas.width / 2) - (currentRoom.width / 2),
						 (canvas.height / 2) - (vertDoorHeight / 2),
						 vertDoorWidth, vertDoorHeight);
		}
	}
	
	for (i = 0; i < bullets.length; i++) {
		if (bullets[i].shooter == "player") {
			ctx.fillStyle = '#226666';
		} else {
			ctx.fillStyle = '#802815';
		}
		ctx.fillRect(bullets[i].posX - (bullets[i].size / 2), 
					 bullets[i].posY - (bullets[i].size / 2), 
					 bullets[i].size, bullets[i].size
		);
	}
	
	ctx.fillStyle = '#AA3C39';
	for (i = 0; i < enemies.length; i++) {
		ctx.fillRect(enemies[i].posX - (enemies[i].size / 2), 
					 enemies[i].posY - (enemies[i].size / 2), 
					 enemies[i].size, enemies[i].size
		);
	}
	
	ctx.fillStyle = '#4C668C';
	ctx.fillRect(playerX - (playerWidth  / 2),
				 playerY - (playerHeight / 2),
				 playerWidth, playerHeight
	);
	
	ctx.strokeRect(healthbarX, healthbarY,
				   healthbarW, healthbarH
	);
	
	ctx.fillStyle = '#9FE3B1';
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