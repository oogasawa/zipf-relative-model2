
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
var exec  = require("child_process").exec;

class ScoreActor {
	initialize(selfActor) {
		this.selfActor = selfActor;
	}

	stress(sec) {
		exec(sprintf("stress -c 1 --timeout %d" + sec),
			 (err, stdout, stderr)={});
	}
}

module.exports = ScoreActor;
