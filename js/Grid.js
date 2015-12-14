function Grid() {
	this.nColumns = 9;
	this.nRows = 9;
	this.rowHeight = cvHeight/this.nRows;
	this.columnWidth = cvWidth/this.nColumns;
	this.gridContainer = new createjs.Container();
	this.availableSwaps = [];
	this.swapped = [];
	this.isGoodSwap=false;
	//this.doneZap=false;
	this.animatedRefillsNum=0;
	this.animatingPieces=[];
	this.columnFillCounter = [];
	//------------------------
	$(document).on('swiped', this.onSwipe);
	this.autoPlay = false;

	this.expectedKills = null;
	this.killing = null;
	this.killed = null;
}

Grid.prototype.onSwipe = function(e, swipe) {
	grid.treatSwipe(swipe);
}

Grid.prototype.treatSwipe = function(swipe) {
	//this.doneZap=false;
	this.swapped = [];
	var piece1=grid.pieces[swipe.columnPressed][swipe.rowPressed];
	this.swapped.push(piece1);
	var piece2=this.pieces[swipe.columnSwiped][swipe.rowSwiped];
	this.swapped.push(piece2);
	this.isGoodSwap=this.checkIfGoodSwap();

	this.countAnimFinished = 0;
	if(this.isGoodSwap) {
		if(!this.autoPlay){
			resources.playSound("goodSwap");
		}
		console.log("PIECE1",piece1)
		piece1.animateTo(piece2.column, piece2.row, this.animationFinished, this, true);
		piece2.animateTo(piece1.column, piece1.row, this.animationFinished, this, false);	
	}else{
		console.log("BAD SWAP");
		if(!this.autoPlay){
			resources.playSound("badSwap");
		}
		piece1.animateToAndFrom(piece2.column, piece2.row, this.animationFinished, this, true);
		piece2.animateToAndFrom(piece1.column, piece1.row, this.animationFinished, this, false);
	}
}

Grid.prototype.animationFinished = function() {
	this.countAnimFinished+=1;
	if(this.countAnimFinished == 2) {
		if (this.isGoodSwap){
			// Invert the pieces in the "pieces" array - swap pieces column and row values
			var piece1 = this.swapped[0];
			var piece2 = this.swapped[1];
			var c1 = piece1.column;
			var r1 = piece1.row;
			piece1.column = piece2.column;
			piece1.row = piece2.row;
			piece2.column = c1;
			piece2.row = r1;
			grid.pieces[swipe.columnPressed][swipe.rowPressed] = piece2;
			grid.pieces[swipe.columnSwiped][swipe.rowSwiped] = piece1;
			grid.findPiecesToZap();
		} else {
			if(!this.autoPlay) {
				swipe.setSwipeEvents();
			} else {
				this.autoSwipe();
			}
		}
	}
}

Grid.prototype.fillInitialGrid = function() {
	this.pieces = [];
	do{
		for(var column=0;column<this.nColumns;column++) {
			this.pieces.push([]);
			for(var row=0;row<this.nRows;row++) {
				do {
				   var type = Math.floor((Math.random() * piecesModel.numPieceTypes) + 1);
				} while ((row >= 2 &&
					this.pieces[column][row-1].type == type &&
					this.pieces[column][row-2].type == type
					)
					||
					(column >= 2 &&
					this.pieces[column-1][row].type == type &&
					this.pieces[column-2][row].type == type
					));
				this.pieces[column].push(new Piece(column,row,this.columnWidth,this.rowHeight,type));
			}
		}
		for(var column = 0;column<this.nColumns;column++) {
			for(var row = 0;row<this.nRows;row++) {
				this.gridContainer.addChild(this.pieces[column][row].container);
			}
		}
		this.detectAvailableSwaps();
	} while(this.availableSwaps.length == 0);
	stage.addChild(this.gridContainer);
	this.consoleGrid();
	score = 0;
	$('#score').html(score);
	if(this.autoPlay) {
		this.autoSwipe();
	}
	//this.consoleAvailableSwaps();
}

Grid.prototype.autoSwipe = function() {
	swipe.stopSwipeEvents();
	console.log("this.availableSwaps",this.availableSwaps[0][0].column);
	if(this.availableSwaps.length == 0)
	{
		console.log("GAME OVER");
	} else {
		swipe.columnPressed = this.availableSwaps[0][0].column;
		swipe.rowPressed = this.availableSwaps[0][0].row;
		swipe.columnSwiped = this.availableSwaps[0][1].column;
		swipe.rowSwiped = this.availableSwaps[0][1].row;
		grid.treatSwipe(swipe);


		// var piece1=grid.pieces[swipe.columnPressed][swipe.rowPressed];
		// this.swapped.push(piece1);
		// var piece2=this.pieces[swipe.columnSwiped][swipe.rowSwiped];
	}



		//grid.treatSwipe(swipe);
}

//----------------------------------------------------------- Console functions
Grid.prototype.consoleGrid = function() {
	console.log("----------------------------------");
	for(var row = this.nRows-1;row>=0;row--) {
		console.log(this.pieces[0][row].type,this.pieces[1][row].type,this.pieces[2][row].type,this.pieces[3][row].type,this.pieces[4][row].type,this.pieces[5][row].type,this.pieces[6][row].type,this.pieces[7][row].type,this.pieces[8][row].type);
	}
	console.log("----------------------------------",this.gridContainer.numChildren);
}

Grid.prototype.consolePosAlpha = function() {
	for (var column = 0; column < this.nColumns; column++) {
		for (var row = 0; row < this.nRows; row++) {
			if(this.pieces[column][row].container.visible == false) {
				console.log("ALERT VISIBLE",column,row)
			}
		}
	}
}

Grid.prototype.consoleAvailableSwaps = function() {
	console.log("availableSwaps");
	for(var i = 0;i<this.availableSwaps.length;i++) {
		console.log(this.availableSwaps[i][0].column,this.availableSwaps[i][0].row, " - " ,this.availableSwaps[i][1].column, this.availableSwaps[i][1].row);
	}
}
//----------------------------------------------------------- Console functions


Grid.prototype.detectAvailableSwaps = function() {
	this.availableSwaps=[];
	// ITERATE THROUGH THE GRID
    for (var column = 0; column < this.nColumns; column++) {
		for (var row = 0; row < this.nRows; row++) {
			// TEST THE PIECE ABOVE
    		if (row < this.nRows - 1) {
    			var pieceToTest1 = this.pieces[column][row];
    			var pieceToTest2 = this.pieces[column][row+1];
    			this.pieces[column][row] = pieceToTest2;
    			this.pieces[column][row+1] = pieceToTest1;
			  	// TEST IF THE SWAP WITH UNDERNEATH FORMS A LINE OF THREE
			  	if ((this.checkForThree(column,row+1)) ||
			  		(this.checkForThree(column,row))) {
			  		//pieceToTest1.container.alpha = 0.5;
			  		//pieceToTest2.container.alpha = 0.5;
			  		var pairToSwap = [pieceToTest1,pieceToTest2];
			  		this.availableSwaps.push(pairToSwap);
			  	}
			  	this.pieces[column][row] = pieceToTest1;
    			this.pieces[column][row+1] = pieceToTest2;
			}
    		// TEST THE PIECE TO THE RIGHT
    		if (column < this.nColumns - 1) {
    			var pieceToTest1 = this.pieces[column][row];
    			var pieceToTest2 = this.pieces[column + 1][row];
    			this.pieces[column][row] = pieceToTest2;
    			this.pieces[column+1][row] = pieceToTest1;
			  	// TEST IF THE SWAP WITH RIGHT FORMS A LINE OF THREE
			  	if ((this.checkForThree(column+1,row)) ||
			  		(this.checkForThree(column,row))) {
			  		//pieceToTest1.container.alpha = 0.5;
			  		//pieceToTest2.container.alpha = 0.5;
			  		var pairToSwap = [pieceToTest1,pieceToTest2];
			  		this.availableSwaps.push(pairToSwap);
			  	}
			  	this.pieces[column][row] = pieceToTest1;
    			this.pieces[column+1][row] = pieceToTest2;
			}
    	} 
  	}
  	
}

Grid.prototype.checkForThree = function(column,row) {
	var piece = this.pieces[column][row];

	// Test horizontal line
	var hLength = 1;
	// Test left
	for(var i = column-1;i>=0 && this.pieces[i][row].type == piece.type;i--) {
		hLength++;
	}
	// Test right
	for(var i = column+1;i<this.nColumns && this.pieces[i][row].type == piece.type;i++) {
		hLength++;
	}
	if(hLength>=3) {
		return true;
	}

	var vLength = 1;
	// Test up
	for(var i = row-1;i>=0 && this.pieces[column][i].type == piece.type;i--) {
		vLength++;
	}
	// Test down
	for(var i = row+1;i<this.nRows && this.pieces[column][i].type == piece.type;i++) {
		vLength++;
	}
	if(vLength>=3) {
		return true;
	}
}

Grid.prototype.checkIfGoodSwap = function() {

	var swapped1 = [grid.swapped[0].column,grid.swapped[0].row];
	var swapped2 = [grid.swapped[1].column,grid.swapped[1].row];
	var foundGoodSwap = false;
	for(var i = 0;i<this.availableSwaps.length;i++) {
		var available1 = [this.availableSwaps[i][0].column,this.availableSwaps[i][0].row];
		var available2 = [this.availableSwaps[i][1].column,this.availableSwaps[i][1].row];
		if((String(swapped1) == String(available1)) && (String(swapped2) == String(available2)) ||
				(String(swapped1) == String(available2)) && (String(swapped2) == String(available1))
		     ){
			foundGoodSwap = true;
		}
	}
	return foundGoodSwap;
}

Grid.prototype.findPiecesToZap = function() {
	//HORIZONTAL THREE OR MORE
	//this.foundPiecesToZap = false;
	this.piecesToZap = [];
	for (var row = 0; row < this.nRows; row++) {
	    for (var column = 0; column < this.nColumns - 2;) {
	    	var countZapH = 0;
	        var typeToFind = this.pieces[row][column].type;
	        if (this.pieces[row][column + 1].type == typeToFind
	         && this.pieces[row][column + 2].type == typeToFind) {
	        	do {
	        		countZapH+=1;
	        		this.pieces[row][column].container.alpha = 0.5;
	        		this.piecesToZap.push(this.pieces[row][column]);
	        		column += 1;
	        	}
	        	while((column < this.nColumns) && (this.pieces[row][column].type == typeToFind));
	        	console.log("countZapH",countZapH);
	        }
	      column += 1;
	    }
  	}
	//VERTICAL THREE OR MORE
	for (var column = 0; column < this.nColumns; column++) {
  		for (var row = 0; row < this.nRows - 2;) {
	    	var countZapV = 0;
	        var typeToFind = this.pieces[row][column].type;
	        if (this.pieces[row + 1][column].type == typeToFind
	         && this.pieces[row + 2][column].type == typeToFind) {
	        	do {
	        		countZapV+=1;
	        		this.pieces[row][column].container.alpha = 0.5;
	        		if(this.piecesToZap.indexOf( this.pieces[row][column]) == -1) {
	        			this.piecesToZap.push(this.pieces[row][column]);
	        		}
	        		row += 1;
	        	}
	        	while((row < this.nRows) && (this.pieces[row][column].type == typeToFind));
	        	console.log("countZapV",countZapV);
	        }
	      row += 1;
	    }
  	}
  	
  	if (this.piecesToZap.length !== 0) {
  		console.log("KILLS",this.piecesToZap.length);

  		this.expectedKills = this.piecesToZap.length;
  		console.log("OOOOOOOOOOOOOO KILLING = 0")
  		this.killing = 0;


  		//this.removeDeadAnimalsFromDisplay();
  		this.initialiseColumnFillCounter();
  		for(var i=this.piecesToZap.length-1; i>=0; i-- ){

  			this.killing++;
  			console.log("KKKKKKKKKKKKKKK IM KILLING",this.killing)

  			this.updateScore(1);
  			var piece= this.piecesToZap[i];
  			var columnArray=this.pieces[piece.column][piece.row];
  			this.pieces[piece.column].splice(piece.row,1);
  			this.columnFillCounter[piece.column]++;
  			var type = Math.floor((Math.random() * piecesModel.numPieceTypes) + 1);
  			var newPiece = new Piece(piece.column,this.pieces[piece.column].length+this.columnFillCounter[piece.column],this.columnWidth,this.rowHeight,type);
  			this.pieces[piece.column].push(newPiece);
  			this.gridContainer.addChild(newPiece.container);
  		}
  		this.removeDeadAnimalsFromDisplay();
  		console.log("this.killing",this.killing);
  		this.animateGrid();
  		console.log("this.columnFillCounter",this.columnFillCounter);
  		return true;

  	}
  	return false;
}

Grid.prototype.initialiseColumnFillCounter = function() {
	this.columnFillCounter = [];
	for(var column=0;column<this.nColumns;column++) {
		this.columnFillCounter.push(0);
	}
}
 
Grid.prototype.animateGrid = function() {
	this.animatedRefillsNum=0;
	this.animatingPieces=[];
	for (var column = 0; column < this.pieces.length; column++) {
  		for (var row = 0; row < this.pieces[column].length; row++) {
  			var piece = this.pieces[column][row];
  			if( (piece.row!=row) || (piece.column!=column) ){
  				this.animatingPieces.push(piece);
  				var time=(piece.row-row)*300;
  				piece.animateTo(column, row, this.animationFillFinished, this, false,time);
  			}
  		}
  	}
}

Grid.prototype.removeDeadAnimalsFromDisplay = function() {
	this.killed = 0;
	console.log("this.gridContainer beforeRemoveDead",this.gridContainer.numChildren);
	for(var i = this.gridContainer.numChildren-1;i>=0;i--) {
		//console.log(i,this.gridContainer.getChildAt(i).alpha)
		if(this.gridContainer.getChildAt(i).alpha !== 1) {
			this.gridContainer.removeChildAt(i);
			this.killed++;
			console.log("KILL IT")
		}
	}
	console.log("COMPARE",this.killing,this.killed);
	if(this.killing!==this.killed) {
		console.log("XXXXXXXXXXXXXXXX")
	}
	console.log("this.gridContainer afterRemoveDead",this.gridContainer.numChildren);
 }

Grid.prototype.animationFillFinished = function() {
	this.animatedRefillsNum++;
	if(this.animatedRefillsNum>=this.animatingPieces.length){
		for (var column = 0; column < this.pieces.length; column++) {
	  		for (var row = 0; row < this.pieces[column].length; row++) {
	  			var piece = this.pieces[column][row];
	  			piece.row=row;
	  			piece.column=column;
  			}
  		}
		if(!this.findPiecesToZap()) {
  			this.detectAvailableSwaps();
  			if(!this.autoPlay) {
				swipe.setSwipeEvents();
			} else {
				this.autoSwipe();
			}
  		}
	}
	//this.consoleGrid();
	//this.consoleAvailableSwaps();
	this.consolePosAlpha();
	if(this.gridContainer.numChildren !== 81) {
		console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
	}
	console.log("this.gridContainer afterFill",this.gridContainer.numChildren);
}

Grid.prototype.updateScore = function(pointsToAdd) {
	score+=pointsToAdd;
	$('#score').html(score);
}