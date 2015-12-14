$( document ).ready(loadXMLDoc);

function loadXMLDoc(){
	$.ajax({
		type: "GET",
		url: "xml/pieces.xml",
		dataType: "xml",
		success: xmlLoaded
	});
}

var grid,swipe,resources,score;
function xmlLoaded(xmlPieces){
	piecesModel = new PiecesModel(xmlPieces);
	createCanvas();
	initTiming ();
	swipe = new Swipe();
	swipe.setSwipeEvents();
	grid = new Grid();
	grid.fillInitialGrid();
	resources = new Resources();
	resources.loadSounds();
}

/**
    Canvas implementation
*/
var stage = null,
	cvWidth = null,
	cvHeight = null;

function createCanvas(){
	var canvas = $('#canvas')[0];
	canvas.width = cvWidth = 630;
  	canvas.height = cvHeight = 630;
  	stage = new createjs.Stage("canvas");
  	console.log("stage",stage)
  	createjs.Touch.enable(stage);
}

function initTiming () {
	createjs.Ticker.timingMode = createjs.Ticker.RAF; // Assures time based animation
	createjs.Ticker.on("tick", this.loop); // Event listener and call
	createjs.Ticker.setFPS(60); // Desired FPS
}

function loop (event) {
	stage.update(event); // Redraw canvas
}