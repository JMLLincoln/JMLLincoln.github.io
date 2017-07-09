window.onload = function() {

	canvasElement = document.getElementById("gc");
	scoreElement = document.getElementById("score");
	hicoreElement = document.getElementById("hiscore");
	form = document.getElementById("form");
	canvContext = canvasElement.getContext("2d");
	document.addEventListener("keydown",keyPush);
}

playerPosX = 20;
playerPosY = 20;
gridSize = 40
tc = 20;
applePosX = 5;
applePosY = 5;
playerVelocityX = 0;
playerVelocityY = 0;
trail = [];
tail = 5;
score = 0;
hiscore = 0;

function game() {

    scoreElement.innerHTML = "Current Score: " + score;
	playerPosX += playerVelocityX;
	playerPosY += playerVelocityY;
	if(playerPosX<0) {
		playerPosX = tc-1;
	}
	if(playerPosX>tc-1) {
		playerPosX = 0;
	}
	if(playerPosY<0) {
		playerPosY = tc-1;
	}
	if(playerPosY>tc-1) {
		playerPosY = 0;
	}
	canvContext.fillStyle = "white";
	canvContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

	canvContext.fillStyle = "black";
	
	for(var i = 0;i<trail.length;i++) {
		canvContext.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);
		if(trail[i].x == playerPosX && trail[i].y == playerPosY) {
			tail = 5;
			if(score > hiscore) {
			    hiscore = score;
			    hicoreElement.innerHTML = "High Score: " + hiscore;
			}
			score  =  0;
		}
	}
	trail.push({x:playerPosX, y:playerPosY});
	while(trail.length>tail) {
	    trail.shift();
	}

	if(applePosX == playerPosX && applePosY == playerPosY) {
		tail++;
		applePosX = Math.floor(Math.random() * tc);
		applePosY = Math.floor(Math.random() * tc);
		score++;
	}
	canvContext.fillStyle = "gray";
	canvContext.fillRect(applePosX * gridSize, applePosY * gridSize, gridSize - 2, gridSize - 2);
	
}

function keyPush(evt) {

	switch(evt.keyCode) {
	
	    case 65:
		case 37:
			playerVelocityX=-1;playerVelocityY = 0;
			break;
		case 87:
		case 38:
			playerVelocityX = 0;playerVelocityY=-1;
			break;
		case 68:
		case 39:
			playerVelocityX = 1;playerVelocityY = 0;
			break;
		case 83:
		case 40:
			playerVelocityX = 0;playerVelocityY = 1;
			break;
	}
}

function completeForm(x){

    form.style.display  =  "none";
    setInterval(game, 1000/x);
}
