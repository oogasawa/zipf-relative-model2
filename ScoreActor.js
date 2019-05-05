
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;


class ScoreActor {
	initialize(selfActor) {
		this.selfActor = selfActor;
	}
}

module.exports = ScoreActor;
