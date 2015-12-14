function Resources() {

}

Resources.prototype.loadSounds = function() {
	createjs.Sound.registerSound({id:"badSwap", src:"sounds/badswap.mp3"});
	createjs.Sound.registerSound({id:"goodSwap", src:"sounds/goodswap.mp3"});
}

Resources.prototype.playSound = function(sound) {
	createjs.Sound.play(sound);
}