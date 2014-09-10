/**
 * Helper.js - Contains commonly used functions and objects used in my games
 * 
 * Objects:
 * - Canvas
 * - InputHandler
 * - Sprite
 * - FPSCounter
 */

"use strict"; 

/**
 * @class Canvas
 * Abstracts the initialisation of the canvas when making games, mostly code reuse.
 * 
 * @property {object} canvas	- canvas element reference
 * @property {object} ctx		- canvas drawing context reference
 * @property {number} width		- width of the canvas
 * @property {number} height	- height of the canvas
 */
function Canvas(width, height) {
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.width = width;
	this.canvas.height = this.height = height;

	this.ctx = (function(ctx) {
		return ctx;
	})(this.canvas.getContext("2d"));

	document.body.appendChild(this.canvas);
}

/**
 * @property {function} drawBackground
 * Fills the background of the canvas with a color.
 * @param {string} color - background color
 */
Canvas.prototype.drawBackground = function(color) {
	this.ctx.save();

	this.ctx.fillStyle = color;
	this.ctx.fillRect(0, 0, this.width, this.height);

	this.ctx.restore();
};

/**
 * @property {function} drawSprite
 * Draws any sprite to the canvas.
 * @param {object} sprite 	- Sprite object reference
 * @param {number} x		- canvas x position, where to draw
 * @param {number} y		- canvas y position, where to draw
 */
Canvas.prototype.drawSprite = function(sprite, x, y) {
	this.ctx.drawImage(sprite.img, sprite.x, sprite.y, 
		sprite.w, sprite.h, x, y, sprite.w, sprite.h);

};

/**
 * @property {function} clearCanvas
 * Completely clears the canvas.
 */
Canvas.prototype.clearCanvas = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};

/**
 * Animate - Main game loop
 * @param {function} loop - game draw and update methods go here.
 * @param {object} canvas - a reference to the canvas.
 */
function Animate(loop, canvas) {
		
	/**
	 * raf - request animation frame
	 * Reference to the correct requestAnimationFrame function for the platform. 
	 */
	var raf = (function() {
		return window.requestAnimationFrame ||      // IE 10, Firefox 23, Safari 7 and Chrome
	        window.webkitRequestAnimationFrame ||   // older versions of Safari & Chrome
	        window.mozRequestAnimationFrame ||      // Firefox 22 or older
            window.oRequestAnimationFrame ||        // opera web browser
            window.msRequestAnimationFrame;         // IE < 10
	})();

	// run - animation callback function.
	function run() {
	    loop();
	    raf(run, canvas);
	}
	run();
}

// Key Codes
/*
var KEY_UP     = 38,
	KEY_DOWN   = 40,
	KEY_LEFT   = 37,
	KEY_RIGHT  = 39,
	KEY_A      = 65, 	
	KEY_D      = 68, 
	KEY_W      = 87, 
	KEY_S      = 83, 	
	KEY_SPACE  = 32;
*/
var keys = {
    KEY_UP     : 38,
    KEY_DOWN   : 40,
    KEY_LEFT   : 37,
    KEY_RIGHT  : 39,
    KEY_A      : 65,    
    KEY_D      : 68, 
    KEY_W      : 87, 
    KEY_S      : 83,    
    KEY_SPACE  : 32
};

/**
 * @class InputHandler
 * Class handles the input to the game.
 * 
 * @property {object} down      - object containing all the currently pressed (held down) keys.
 * @property {object} pressed   - object containing all the pressed keys (already down).
 * @property {object} _this     - reference to the InputHandler object.
 *
 * the first event handler listens for a keydown event (any key pressed down).
 * it adds a record or property to down with a key code as the key and a boolean
 * value representing if that key is down or not.
 *
 * the second event handler removes the key from the two objects,
 * the pressed object is explained in isPressed documentation.
 */
function InputHandler() {

	this.down = {}; // keys that are down (inc. held)
	this.pressed = {}; // keys that are down (not held)

	var _this = this;

	document.addEventListener("keydown", function(evt) {
		_this.down[evt.keyCode] = true; // this would point to document.
	});
	
	document.addEventListener("keyup", function(evt) {
		delete _this.down[evt.keyCode];
		delete _this.pressed[evt.keyCode];
	}); 
}

/**
 * @property {function} isDown
 * checks if specific key is down or held down
 * @param {string} code   - key code, number but stored as a string.
 * @return {bool}         - returns if the key is down or not
 */
InputHandler.prototype.isDown = function(code) {
	return this.down[code];
};

/**
 * @property {function} isPressed
 * checks if specific key has been pressed, used
 * to prevent hold down spam i.e. projectile spam.
 *
 * if the key (argument code) exists in the object pressed
 * then return false as the key has already been pressed once. (isDown -> true)
 * 
 * if the key exists in the object down and is not in the object pressed (or false)
 * then add the key to the object pressed or assign it to true, return true.
 *
 * else return false as the key is not down and has not been pressed. 
 * AKA no event for that key
 *
 * @param {string} code   - key code, number but stored as a string.
 * @return {bool}         - returns if the key has been pressed or not
 */
InputHandler.prototype.isPressed = function(code) {
	if (this.pressed[code]) {
		return false;
	} else if (this.down[code]) {
        this.pressed[code] = true;
        return this.pressed[code];
	}
	return false;
};

/**	
 * AABB Intersect - basic collision detection
 * Check if to axis aligned bounding boxes intersects
 * 
 * @return {bool}  result of the calculation
 */
function AABBIntersect(a, b) {
	return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * @class Sprite
 * @property {object} Image		- Image element reference
 * @property {number} x			- x position of sprite on spritesheet
 * @property {number} y			- y position of sprite on spritesheet
 * @property {number} width		- sprite width
 * @property {number} height	- sprite height
 * 
 * Sprite object holds all the crucial data required to read and 
 * store the image/sprite.
 */
function Sprite(img, x, y, w, h) {
	 this.img = img;
	 this.x = x;
	 this.y = y;
	 this.width = w;
	 this.height = h;
}

/**
 * @property {function} draw
 * Draws the sprite to the canvas.
 * @param {object} ctx 	 	- reference to canvas 2d context
 * @param {number} x		- canvas x position, where to draw
 * @param {number} y		- canvas y position, where to draw
 */
Sprite.prototype.draw = function(ctx, x, y) {
	ctx.drawImage(this.img, this.x, this.y, 
		this.w, this.h, x, y, this.w, this.h);

};

/**
 * @class FPSCounter
 * @param {object} ctx
 * @property {object} ctx			- canvas drawing context reference
 * @property {number} current		- the current frame
 * @property {number} last			- the last frame before refresh (so no. frames that second)
 * @property {number} lastUpdated	- time the last fps was taken
 * 
 * FPSCounter object is a useful utility even though chrome dev
 * tools already comes with an fps counter, mainly just for show.
 */
function FPSCounter(ctx) {
	this.current = 0;
	this.last = 0;
	this.lastUpdated = Date.now();
	this.ctx = ctx;
}

/**
 * @property {function} draw
 * draws the fps to the canvas.
 */
FPSCounter.prototype.draw = function() {
	this.ctx.save();

	this.ctx.font = "12pt Arial";
	this.ctx.fillStyle = "#fff";
	this.ctx.textBaseline = "top";
	this.ctx.fillText(this.last + "fps", 5, 5);
	this.ctx.fill();

	this.ctx.restore();
};

/**
 * @property {function} update
 * calculates and updates fps.
 */
FPSCounter.prototype.update = function() {
	this.current++;
	if (Date.now() - this.lastUpdated >= 1000) {
	    this.last = this.current;
	    this.current = 0;
	    this.lastUpdated = Date.now();
	}
};

/**
 * Project todo:
 * should all game objects (objects drawn to the screen) have 
 * their own draw, update and init methods? sort of like an 
 * interface or abstract class.
 *
 * Abstract the state or pause menu,
 * better input handler object. all keyboard mouse and touch io.
 * also test this shit! ASAP
 */