/* ----- FlipPanel class ----- */

var FlipPanel = function(parent, callback, opts) {
	// Set up properties
	this.parent = parent;
	this.callback = callback;

	// Handle optional parameters
	this.nx = opts.hasOwnProperty('nx') ? opts.nx : 2;
	this.ny = opts.hasOwnProperty('ny') ? opts.ny : 3;
	this.imgFront = opts.hasOwnProperty('imgFront') ? opts.imgFront : '';
	this.imgBack = opts.hasOwnProperty('imgBack') ? opts.imgBack : this.imgFront;
	this.ruffleTimer = opts.hasOwnProperty('ruffleTimer') ? opts.ruffleTimer : null;
	this.ruffleDelay = opts.hasOwnProperty('ruffleDelay') ? opts.ruffleDelay : 120;

	// Pre-allocate tile array
	this.tile = [];
	for (var y=0; y<this.ny; y++) {
		this.tile.push(new Array(this.nx));
	}

	// Find the dimensions of the panel image
	var img = new Image(), target = this;
	img.onload = function() {
		target.imgWidth = this.width;
		target.imgHeight = this.height;
		target.updateSize();
		target.create();
	}
	img.onerror = function() {
		target.imgWidth = NaN;
		target.imgHeight = NaN;
		target.updateSize();
		target.create();
	}
	img.src = this.imgFront;
}

FlipPanel.prototype.create = function() {
	// Create the panel
	this.dom = document.createElement('div');
	this.dom.className += 'flip-panel';
	this.parent.appendChild(this.dom);

	// Apply styles
	// ** INSTEAD, MAKE THIS THING HAVE A CLASS, RIGHT NOW IT'S A PLAIN DIV!!!
	this.dom.style.width = '100%';
	this.dom.style.height = '100%';

	// Create each tile
	for (var y=0; y<this.ny; y++) {
		for (var x=0; x<this.nx; x++) {
			this.tile[y][x] = this.createTile(x, y);
		}
	}

	// Update tiles any time the panel is resized
	// (initial update is performed once image size is determined above)
//	this.dom.addEventListener('resize', this.update.bind(this), false);
	window.addEventListener('resize', this.update.bind(this), false);

	// Add ruffle effect
	if (this.ruffleTimer != null) {
		// ** TO CONSIDER: using 'bind' below makes it impossible to remove the listener, which is bad
		window.addEventListener('load', this.ruffle.bind(this), false);
		if (this.ruffleTimer > 0)	{ setInterval(this.ruffle.bind(this), this.ruffleTimer); }
	}

	// Execute callback
	this.callback(this);
}

FlipPanel.prototype.createTile = function(x, y) {
	// Create the tile
	var tile = new FlipTile(this.dom);

	// Calculate the tile's width and height
	var w = Math.floor(100/this.nx), h = Math.floor(100/this.ny);
	var w2 = (x<this.nx-1 ? w:100-(x*w)), h2 = (y<this.ny-1 ? h:100-(y*h));

	// Set the tile's position
	tile.dom.style.position = 'absolute';
	tile.dom.style.left = x*w + '%';
	tile.dom.style.top = y*h + '%';
	tile.dom.style.width = w2 + '%';
	tile.dom.style.height = h2 + '%';

	// Set the tile's background image
	this.updateTile(tile);
	tile.domFront.style.backgroundImage = 'url("' + this.imgFront + '")';
	tile.domBack.style.backgroundImage = 'url("' + this.imgBack + '")';

	// Return the tile
	return tile;
}

FlipPanel.prototype.update = function() {
	// Update the panel size info
	this.updateSize();

	// Loop through each tile and update its styles
	for (var y=0; y<this.ny; y++) {
		for (var x=0; x<this.nx; x++) {
			this.updateTile(this.tile[y][x]);
		}
	}
}

FlipPanel.prototype.updateSize = function() {
	// Find the new dimensions of the parent element, accounting for portrait/landscape
	//		NOTE: .offsetWidth and .offsetHeight are more accurate but slower
//	var parentX = this.parent.clientWidth, parentY = this.parent.clientHeight;
//	var parentWidth = Math.max(parentX, parentY);
//	var parentHeight = Math.min(parentX, parentY);
	var parentWidth = this.parent.clientWidth;
	var parentHeight = this.parent.clientHeight;

	// Create a size string for later use
	this.sizeString = Math.round(parentWidth) + 'px';

	// Calculate the required offset of the top of the image
	var scaleFactor = parentWidth / this.imgWidth;
	var scaledHeight = this.imgHeight * scaleFactor;
	this.topOffset = (parentHeight - scaledHeight) / 2;
}

FlipPanel.prototype.updateTile = function(tile) {
	// Calculate the position for the tile's background image
	var backPos = [Math.round(-tile.dom.offsetLeft), Math.round(-tile.dom.offsetTop + this.topOffset)];
	var posString = backPos[0] + 'px ' + backPos[1] + 'px';
	var sizeString = this.sizeString;

	// Update the front and back image
	tile.domFront.style.backgroundPosition = posString;
	tile.domFront.style.backgroundSize= sizeString;
	tile.domBack.style.backgroundPosition = posString;
	tile.domBack.style.backgroundSize= sizeString;
}

FlipPanel.prototype.ruffle = function() {
	var ind = 0, maxInd = this.nx*this.ny, delay=this.ruffleDelay;
	for (var y=0; y<this.ny; y++) {
		for (var x=0; x<this.nx; x++) {
			tile = this.tile[y][x];
			setTimeout(tile.flip.bind(tile), ind*delay);
			setTimeout(tile.flip.bind(tile), (maxInd+ind+2)*delay);
			ind++;
		}
	}
}


/* ----- FlipTile class ----- */

var FlipTile = function(parent) {
	// Set up properties
	this.parent = parent;

	// Create the tile
	this.dom = create(parent, this.html);
	this.domFront = this.dom.children[0].children[0];
	this.domBack = this.dom.children[0].children[1];
	//this.domFront.addEventListener('click', this.flip.bind(this), false);

	// Un-focus the tile if the back is clicked
	// ** INTEGRATE TOUCHSTART EVENTS FOR PHONES
	// ** Actually, 'click' is triggering on my Android - problem is hover
	this.domBack.addEventListener('click', this.hide.bind(this), false);
	this.domBack.addEventListener('touchstart', this.hide.bind(this), false);

	this.domFront.addEventListener('click', this.show.bind(this), false);
	this.domFront.addEventListener('touchstart', this.show.bind(this), false);
}

FlipTile.prototype.flip = function() {
	// Flip the tile by toggling 'hover' class
	this.dom.classList.toggle('hover');
}
FlipTile.prototype.show = function() {
	var tiles = document.getElementsByClassName('hover');
	while (tiles.length)
		tiles[0].classList.remove('hover');

	this.dom.classList.add('hover');
}
FlipTile.prototype.hide = function() {
	this.dom.classList.remove('hover');
	this.dom.blur();
}

FlipTile.prototype.applyTemplate = function(face, contents) {
	// Generate the HTML for the tile
	var htmlStr = this.htmlTemplate.replace('%contents%', contents);

	// Apply template to the correct face
	// ** CHECK TO MAKE SURE FACE IS A STRING
	if (face[0] == 'f') {
		return create(this.domFront, htmlStr);
	}
	else {
		return create(this.domBack, htmlStr);
	}
}

FlipTile.prototype.applyText = function(face, title, info) {
	// Build the main text for the tile
	contents = '';
	for (var i=0; i<info.length; i++) {
		contents += '<tr>';
		for (var j=0; j<info[i].length; j++)
			contents += '<td>' + info[i][j] + '</td>';
		contents += '</tr>';
	}

	// Generate the HTML for the tile and apply it
	var htmlStr = this.htmlText.
		replace('%title%', title).
		replace('%contents%', contents);
	this.applyTemplate(face, htmlStr);
}

FlipTile.prototype.applyText2 = function(face, title, contents) {
	// Generate the HTML for the tile and apply it
	var htmlStr = this.htmlText.
		replace('%title%', title).
		replace('%contents%', contents);
	this.applyTemplate(face, htmlStr);
}

FlipTile.prototype.html = `
	<div class="flip-container" tabindex="0">
		<div class="flipper">
			<div class="front"></div>
			<div class="back"></div>
		</div>
	</div>
`;

FlipTile.prototype.htmlTemplate = `
	<table>
		<tr><td> %contents% </td></tr>
	</table>
`;

FlipTile.prototype.htmlText = `
	<h1>%title%</h1>
	<table class="info">
		%contents%
	</table>
`;


/* ----- Helper functions ----- */

function create(dest, htmlStr) {
	// Get the DOM if dest is a string
	if (typeof(dest) === 'string') {
		dest = document.getElementById(dest);
	}

	// Append DOM children one at a time, storing links to each
	var obj = [], temp = document.createElement('div');
	temp.innerHTML = htmlStr.trim();
	while (temp.firstChild) {
		obj.push( dest.appendChild(temp.firstChild) );
	}

	// Remove the list layer for unary objects
	if (obj.length == 1)
		obj = obj[0];

	// Return the created objects
	return obj;
}
