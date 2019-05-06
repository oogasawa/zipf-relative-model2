
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
var exec  = require("child_process").exec;

class ScoreActor {
	initialize(selfActor) {
		this.selfActor = selfActor;
	}

	
	calcScore(freq) {
		let score = 0;
		for (let i=0; i<parameter.numOfGenes; i++) {
			for (let j=i+1; j<parameter.numOfGenes; j++) {
				if (freq[i] > freq[j]) {
					score ++;
				}
			}
		}

		return score;
	}


	stress(sec) {
		exec(sprintf("stress -c 1 --timeout %d", sec),
			 (err, stdout, stderr)=>{}
			);
	}
}

module.exports = ScoreActor;
