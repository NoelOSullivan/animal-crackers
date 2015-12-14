function Swipe() {
	this.rowPressed = null;
	this.columnPressed = null;
	this.rowSwiped = null;
	this.columnSwiped = null;
	this.allowSwipe = true;
}

Swipe.prototype.setSwipeEvents = function()  {
	stage.addEventListener("mousedown", this.startSwipe );
	stage.addEventListener("pressmove", this.manageSwipe );
}

Swipe.prototype.stopSwipeEvents = function()  {
	stage.removeEventListener("mousedown", this.startSwipe );
	stage.removeEventListener("pressmove", this.manageSwipe );
}

Swipe.prototype.startSwipe = function(evt) {
	if(swipe.allowSwipe) {
		this.pressX = stage.mouseX;
		this.pressY = stage.mouseY;
		swipe.rowPressed = Math.floor((cvHeight-this.pressY)/grid.rowHeight);
		swipe.columnPressed = Math.floor(this.pressX/grid.columnWidth);
	}
}

Swipe.prototype.manageSwipe = function(evt) {
	var validSwipe=false;
	swipe.rowSwiped = Math.floor((cvHeight-stage.mouseY)/grid.rowHeight);
	swipe.columnSwiped = Math.floor(stage.mouseX/grid.columnWidth);
	if(swipe.columnSwiped == swipe.columnPressed) {
		if(swipe.rowSwiped > swipe.rowPressed) {
			// Swipe up
			// Avoid swipe detecting more than one square
			swipe.rowSwiped = swipe.rowPressed + 1;
			validSwipe=true;
		} else {
			if(swipe.rowSwiped < swipe.rowPressed) {
				// Swipe down
				// Avoid swipe detecting more than one square
				swipe.rowSwiped = swipe.rowPressed - 1;
				validSwipe=true;
			}
		}
	} else {
		if(swipe.rowSwiped == swipe.rowPressed) {
			if(swipe.columnSwiped < swipe.columnPressed) {
				// Swipe left
				// Avoid swipe detecting more than one square
				swipe.columnSwiped = swipe.columnPressed - 1;
				validSwipe=true;
			} else {
				if(swipe.columnSwiped > swipe.columnPressed) {
					// Swipe right
					// Avoid swipe detecting more than one square
					swipe.columnSwiped = swipe.columnPressed + 1;
					validSwipe=true;
				}
			}
		}
	}

	if(validSwipe){
		$( document ).trigger('swiped', swipe);
		swipe.stopSwipeEvents();
	}
}