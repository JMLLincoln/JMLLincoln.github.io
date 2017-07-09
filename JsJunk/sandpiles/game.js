
function UpdateGrid() {
	
	tmp = document.getElementById("options").elements;
	
	width = parseInt(tmp[0].value) + 2;
	height = parseInt(tmp[1].value) + 2;
	increment = 1; // parseInt(tmp[2].value);
	
	borderCells = [];
	for (i = 0; i < width * height; i++) {
		if (i < width + 1) {
			borderCells.push(i);
		} else if (i >= (height * width) - (width + 1)) {
			borderCells.push(i);
		} else if (i % width == 0) {
			borderCells.push(i);
		} else if ((i + 1) % width == 0) {
			borderCells.push(i);
		}
	}
	
	string = "";
	cells = [];
	for (i = 0; i < height; i++) {
		string += "<tr>";
		for (j = 0; j < width; j++) {
			id = "cell" + (width * i + j);
			string += "<td id=" + id + " width='50px' height='50px' onclick='cellClick(this)'>0</td>";
			cells.push(id);
		}
		string += "</tr>";
	}
	
	grid = document.getElementById("grid");
	grid.innerHTML = string;
	
	for (i = 0; i < cells.length; i++) {
		cells[i] = document.getElementById(cells[i]);
	}
	
	run(30);
}

function run(fps) {
	
	updateFunction = setInterval(updatePiles, 1000 / fps);
}

function stop() {
	
	clearInterval(updateFunction);
}

function cellClick(ele) {
	
	value = parseInt(ele.innerHTML);
	value += increment;
	ele.innerHTML = value;
}

function updateNeighbours(index) {
	neighbourIndecies = [-width, -1, 1, width];
	for (i = 0; i < neighbourIndecies.length; i++) {
		currentIndex = neighbourIndecies[i] + index;
		if (cells[currentIndex] != undefined) {
			value = parseInt(cells[currentIndex].innerHTML);
			value += increment;
			cells[currentIndex].innerHTML = value;
		}
	}
}

function updatePiles() {

	for (i = 0; i < cells.length; i++) {
		value = parseInt(cells[i].innerHTML);
		if (value >= 4) {
			value = 0;
			cells[i].innerHTML = value;
			updateNeighbours(i);
		}
		
		cells[i].className = "intensity" + value;
	}
	
	for (i = 0; i < borderCells.length; i++) {
		cell = cells[borderCells[i]];
		cell.innerHTML = -100;
		cell.className = "bordercell";
	}
}