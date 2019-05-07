
/* Sending messages to actors and collecting responses */
 
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
//var ScoreActor = require('ScoreActor');
//var SimulationActor = require('SimulationActor');

var basePath="/zipf-relative-model2/prototype3";

// ---
 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
 
 
async function main() {
	let actorSystem = actors({pingTimeout: 60000});
	
	let simul = actorSystem
		.rootActor() // Get a root actor reference.
		.then(rootActor => rootActor.createChild(basePath + "/SimulationActor", {mode: "forked"}))


    for (let i=0; i<8; i++) {
	simul.then(s=>s.send("createChild", "192.168.5.11"));
    }
    for (let i=0; i<8; i++) {
	simul.then(s=>s.send("createChild", "192.168.5.12"));
    }
	
	await sleep(2000); // <= !!! important !!!
	simul.then(s=>s.send("info"));
	await sleep(1000);
    simul.then(s=>s.sendAndReceive("start"))
	.then(reply=>{console.log(reply)})
	.finally(()=>actorSystem.destroy());

}
  
main();
