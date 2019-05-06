
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
//var ScoreActor = require('ScoreActor');
//var SimulationActor = require('SimulationActor');

var basePath="/worksXX/ESMS/zipf-relative-model2/prototype3";

// ---
 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
 
 
async function main() {
	let actorSystem = actors();
	
	let simul = actorSystem
		.rootActor() // Get a root actor reference.
		.then(rootActor => rootActor.createChild(basePath + "/SimulationActor", {mode: "forked"}))

	simul.then(s=>s.send("createChild", "192.168.11.24"));
	simul.then(s=>s.send("createChild", "192.168.11.24"));
	simul.then(s=>s.send("createChild", "192.168.11.24"));

	await sleep(2000); // <= !!! important !!!
	simul.then(s=>s.send("info"));
	await sleep(1000);
	simul.then(s=>s.send("start"));

}
  
main();
