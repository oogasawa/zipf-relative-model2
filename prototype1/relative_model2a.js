
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;


class ScoreActor {
	initialize(selfActor) {
		this.selfActor = selfActor;
	}
}



class SimulationActor {
	initialize(selfActor) {
		this.selfActor = selfActor;
		this.children = [];
	}

	createChild() {
		this.selfActor.createChild(ScoreActor, {mode: "remote", cluster: "beta"})
			.then(childActor => {
				// Save created child actor to instance field.
				this.children.push(childActor);
			});
		//console.log("simulation actor: " + this.selfActor.getId());
	}


	info() {
		console.log("Are you there?");
		console.log(this.children.length);
		this.children.forEach(ch=>console.log(ch.getId()));
	}
 
}
 
// ---
 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
 
 
async function main() {
	let actorSystem = actors({
		clusters: {
			alpha: ["192.168.11.14"],
			beta: ["192.168.11.14", "192.168.11.14"]
		}
	});
	
	let simul = actorSystem
		.rootActor() // Get a root actor reference.
		.then(rootActor => rootActor.createChild(SimulationActor))

	await sleep(1000); // <= !!! important !!!
	simul.then(s=>s.send("createChild"));
	simul.then(s=>s.send("createChild"));
	await sleep(1000); // <= !!! important !!!
	simul.then(s=>s.send("info"));
}
  
main();
