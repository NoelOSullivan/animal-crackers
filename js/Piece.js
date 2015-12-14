function Piece(column,row,columnWidth,rowHeight,type) {
	this.column = column;
	this.columnWidth=columnWidth;
	this.rowHeight=rowHeight;
	this.row = row;
	this.animationFinishedCallback;
	this.grid=grid;
	this.type = type;
	this.imageSrc = piecesModel.models[this.type-1].imageSrc;
	this.container = new createjs.Container();
	this.container.movePixels = 4;
	var bitmap = new createjs.Bitmap(this.imageSrc);
	this.container.addChild(bitmap);
	this.container.regX = 32;
	this.container.regY = 32;
	this.container.x = this.container.origX = (columnWidth/2) + (this.column * columnWidth);
	this.container.y = this.container.origY = cvHeight - ((rowHeight/2) + (this.row * rowHeight));
}

Piece.prototype.animateTo = function(column, row, callback, grid, topZ, time) {
	if(time==undefined){
		time=300;
	}
	if(topZ) {
		grid.gridContainer.setChildIndex(this.container,grid.gridContainer.numChildren);
	}
	this.animationFinishedCallback=callback;
	var tweenX = (this.columnWidth/2) + (column * this.columnWidth);
	var tweenY = cvHeight - ((this.rowHeight/2) + (row * this.rowHeight));
	createjs.Tween.get(this.container).to({x:tweenX, y:tweenY}, time).call(this.animationFinishedCallback, null, grid);
}	

Piece.prototype.animateToAndFrom = function(column, row, callback, grid, topZ) {

	if(topZ) {
		grid.gridContainer.setChildIndex(this.container,grid.gridContainer.numChildren-1);
		this.goTop = false;
	} else {
		grid.gridContainer.setChildIndex(this.container,0);
		this.goTop = true;
	}
	this.animationFinishedCallback=callback;
	this.grid=grid;
	createjs.Tween.get (this.container).to({x:(this.columnWidth/2) + (column * this.columnWidth), y:cvHeight - ((this.rowHeight/2) + (row * this.rowHeight))}, 300).call(this.animateBack, null, this);
}	

Piece.prototype.animateBack = function() {
	if(this.goTop) {
		grid.gridContainer.setChildIndex(this.container,grid.gridContainer.numChildren-1);
	} else {
		grid.gridContainer.setChildIndex(this.container,0);
	}
	createjs.Tween.get (this.container).to({x:(this.columnWidth/2) + (this.column * this.columnWidth), y:cvHeight - ((this.rowHeight/2) + (this.row * this.rowHeight))}, 300).call(this.animationFinishedCallback, null, this.grid);
}
