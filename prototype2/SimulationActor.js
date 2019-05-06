
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
//var ScoreActor = require("ScoreAcotr");

var basePath="/worksXX/ESMS/zipf-relative-model2/prototype2";

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
		for (let i=0; i<this.children.length; i++) {
			this.children[i].send("stress", sec);
		}
	}
	
	info() {
		console.log("Are you there?");
		console.log(this.children.length);
		this.children.forEach(ch=>console.log(ch.getId()));
	}
 
}

module.exports = SimulationActor;
