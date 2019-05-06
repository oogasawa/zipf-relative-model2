
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
var exec  = require("child_process").exec;

class ScoreActor {
	initialize(selfActor) {
		this.selfActor = selfActor;
	}

	
	calcScore(freq, ind, numOfGenes) {
		let sc = 0;
		for (let i=0; i<numOfGenes; i++) {
			for (let j=i+1; j<numOfGenes; j++) {
				if (freq[i] > freq[j]) {
					sc ++;
				}
			}
		}

		console.log(sprintf("## %s", this.selfActor.getId()));
		return {index: ind, score: sc};
	}


	stress(sec) {
		exec(sprintf("stress -c 1 --timeout %d", sec),
			 (err, stdout, stderr)=>{}
			);
	}
}

module.exports = ScoreActor;
