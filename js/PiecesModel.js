function PiecesModel(xmlPieces) {

	if(xmlPieces == null) {
		alert("Badly formed XML document")
	}

	this.numPieceTypes = xmlPieces.getElementsByTagName('Piece').length;
	this.models = [];
	for(i=0;i<this.numPieceTypes;i++) {
		var pieceXMLModel = new PieceXMLModel(xmlPieces.getElementsByTagName("Piece")[i]);
		this.models.push(pieceXMLModel);
	};
} 

function PieceXMLModel(pieceNode) {
	var imageNode = pieceNode.getElementsByTagName("Image")[0];
	this.imageSrc = imageNode.getAttribute("src");
}