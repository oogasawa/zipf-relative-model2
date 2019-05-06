
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
//var exec  = require("child_process").exec;
var execSync  = require("child_process").execSync;

class ScoreActor {

	initialize(selfActor) {
		this.selfActor = selfActor;
	}

	stress(sec) {
		execSync(sprintf("stress -c 1 --timeout %d", sec));
	}
}

module.exports = ScoreActor;
