
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
//var ScoreActor = require("ScoreAcotr");

var basePath="/worksXX/ESMS/zipf-relative-model2";

class SimulationActor {
	initialize(selfActor) {
		this.selfActor = selfActor;
		this.children = [];
	}

	createChild() {
		this.selfActor.createChild(basePath + "/ScoreActor", {mode: "remote", cluster: "beta"})
			.then(childActor => {
				// Save created child actor to instance field.
				this.children.push(childActor);
			});
		//console.log("simulation actor: " + this.selfActor.getId());
	}


	stress(sec) {
		this.children.forEach(ch=>ch.stress(sec));
	}
	
	info() {
		console.log("Are you there?");
		console.log(this.children.length);
		this.children.forEach(ch=>console.log(ch.getId()));
	}
 
}

module.exports = SimulationActor;
