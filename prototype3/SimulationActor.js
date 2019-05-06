
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
//var ScoreActor = require("ScoreAcotr");

var basePath="/worksXX/ESMS/zipf-relative-model2";

class SimulationActor {

	initialize(selfActor) {
		this.selfActor = selfActor;
		this.children = [];
		this.result   = [];
	}

	createChild(ip) {
		this.selfActor.createChild(basePath + "/ScoreActor", {mode: "remote", host: ip})
			.then(childActor => {
				// Save created child actor to instance field.
				this.children.push(childActor);
			});
		//console.log("simulation actor: " + this.selfActor.getId());
	}


	async stress(sec) {

		for (let i=0; i<10000; i++) {
			this.children[10000%i]
				.sendAndReceive("stress", sec)
				.then(reply=>{
					this.result.push(reply);
				});

			while (i - this.result.length > 100) { // flow control.
				await sleep(1000);
			}
		}

	}
	
	info() {
		console.log("Are you there?");
		console.log(this.children.length);
		this.children.forEach(ch=>console.log(ch.getId()));
	}
 
}

module.exports = SimulationActor;
