
var actors = require('comedy');
var sprintf = require("sprintf-js").sprintf;
//var ScoreActor = require("ScoreAcotr");

var sort = require("fast-sort");
var StringBuilder = require("node-stringbuilder");
var sprintf = require("sprintf-js").sprintf;
var libR = require("lib-r-math.js");


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));


const {
	Normal, Poisson,
	R: {numberPrecision},
	rng: {MersenneTwister, timeseed}
} = libR;

// Parameter singleton

class Parameter {

	constructor() {
		// random number generator.
		this.precision = numberPrecision(9);
		this.mt    = new MersenneTwister();
		this.runif = this.mt.unif_rand;

		// distributions.
		const { rnorm, dnorm, pnorm, qnorm } = Normal();
		this.rnorm = rnorm;
		this.pnorm = pnorm;

		const { rpois, dpois, ppois, qpois } = Poisson();
		this.rpois = rpois;

		// simulation parameters.
		this.minRna   = 1.0;
		this.totalRna = 300000;
		this.numOfGenes = 20000;

		this.standardDeviation  = 0.01;
		this.propOfMutatedGenes = 0.001;
		this.populationSize     = 100;

		this.c1 = 0.3;
		this.c2 = 2/3;
	}

	nextInt(from, to) {
		return Math.floor(this.runif(1) * (to - from) + from);
	}

	report() {
		let sb = new StringBuilder();
		sb.append(sprintf("## populationSize = %d\n", this.populationSize));
		sb.append(sprintf("## propOfMutatedGenes = %f\n", this.propOfMutatedGenes));
		sb.append(sprintf("## standardDeviation = %f\n", this.standardDeviation));
		sb.append(sprintf("## numOfGenes = %d\n", this.numOfGenes));
		sb.append(sprintf("## totalRna = %f\n", this.totalRna));
		sb.append(sprintf("## minRna = %f\n", this.minRna));
		sb.append(sprintf("## c1 = %f\n", this.c1));
		sb.append(sprintf("## c2 = %f\n", this.c2));

		return sb.toString();
	}
}

const parameter = new Parameter();
Object.freeze(parameter);
//export default parameter;


// -----

class Genome {
	constructor() {
		// The genome of the relative expression level model is a list of floating-point number.
		this.freq       = [];		
	}

	// initialize genomes.
	init(type) {
		if (type == "zipf") {
			this.init_zipf();
		}
		if (type == "normal") {
			this.init_normal();
		}
		else {
			this.init_unif();
		}
	}

	
	init_unif() {
		let f = parameter.totalRna / parameter.numOfGenes;
		for (let i=0; i<parameter.numOfGenes; i++) {
			this.freq[i] = f;
		}
	}

	init_normal() {
		let f = parameter.totalRna / parameter.numOfGenes;
		for (let i=0; i<parameter.numOfGenes; i++) {
			this.freq[i] = parameter.rnorm(1, 1, 1)*f ;
		}
		this.normalize();
	}
	
	init_zipf() {
		let rnaFreq = [];
		let sum     = 0;
		for (let i=1; i<=parameter.numOfGenes; i++) {
			let f = 1/i;
			rnaFreq[i-1] = f;
			sum += f;
		}
		for (let i=1; i<=parameter.numOfGenes; i++) {
			this.freq[i-1] = rnaFreq[i-1] * parameter.totalRna / sum;
		}
	}
	

	copy() {
		let copiedGenome = new Genome();
		for (let i=0; i<this.freq.length; i++) {
			copiedGenome.freq.push(this.freq[i]);
		}
		return copiedGenome;
	}

	
	mutate() {
		// determine the number of mutate loci
		let mu = parameter.propOfMutatedGenes;
		let ng = parameter.numOfGenes;
		let ml = parameter.rpois(1, mu*ng);

		for (let j=0; j<ml; j++) {
			let pos    = parameter.nextInt(0, parameter.numOfGenes-1);
			let a      = this.freq[pos];
			a *=  parameter.rnorm(1, 1.0, parameter.standardDeviation);
			if (a < parameter.minRna) {
				a = parameter.minRna;
			}
			this.freq[pos] = a;
		}
		this.normalize();
	}


	sum(freq) {
		return freq.reduce((total, num)=>{return total+num;});
	}
	
	normalize() {
		let s = this.sum(this.freq);
		for (let i=0; i<this.freq.length; i++) {
			this.freq[i] = this.freq[i] / s * parameter.totalRna;
		}
	}


	report(ind) {
		let sb = new StringBuilder();
		for (let i=0; i<this.freq.length; i++) {
			sb.append(sprintf("%d\t%d\t%f\n", ind, i, this.freq[i]));
		}
		return sb.toString();
	}

	
}



class HaploidIndividual {
	constructor() {
		this.genome = new Genome();
	}

	init(type) {
		this.genome.init(type);
	}

	/*
	calcScore() {
		let score = 0;
		for (let i=0; i<parameter.numOfGenes; i++) {
			for (let j=i+1; j<parameter.numOfGenes; j++) {
				if (this.genome.freq[i] > this.genome.freq[j]) {
					score ++;
				}
			}
		}

		return score;
	}
*/


	makeChild() {
		let child = new HaploidIndividual();
		child.genome = this.genome.copy();
		child.genome.mutate();
		return child;
	}


	report(ind) {
		return this.genome.report(ind);
	}
	
}



class HaploidPopulation {

	constructor() {
		this.individuals = []; // A population is a list of individuals.
		this.scoreArray = [];
	}

	
	init(type) {
		for (let i=0; i<parameter.populationSize; i++) {
			let ind = new HaploidIndividual();
			ind.init(type);
			this.individuals.push(ind);
		}
	}

	

	calcScoreArray() {
		for (let i=0; i<parameter.populationSize; i++) {
			let s = this.individuals[i].calcScore();
			//console.log(sprintf("score: %f", s));
			this.scoreArray.push({index: i, score: s});
		}
	}

	
	
	propagate() {
		let nextPopulation = new HaploidPopulation();

		sort(this.scoreArray).desc(u=>u.score);

		let sum = 0;
		for (let rank=0; rank<this.scoreArray.length; rank++) {
			
			let scoreData = this.scoreArray[rank];
			let indiviual = this.individuals[scoreData["index"]];
			let num = this.calcNumOfChildren(rank);

			if (sum + num > parameter.populationSize) {
				num = parameter.populationSize - sum;
			}

			for (let i=0; i<num; i++) {
				let child = this.individuals[scoreData["index"]].makeChild();
				nextPopulation.individuals.push(child);
			}

			if (sum > parameter.populationSize) {
				break;
			}
		}

		return nextPopulation;
	}

	// rank = 0, 1, 2, ...
	calcNumOfChildren(rank) {
		let nc = parameter.populationSize*parameter.c1;
		return Math.ceil(nc*Math.pow(parameter.c2, rank)); 
	}


	
	report(gen) {
		let sb = new StringBuilder();
		for (let i=0; i<parameter.populationSize; i++) {
			//console.log(sprintf("report: %d\t%s", i, this.scoreArray[i]));
			sb.append(sprintf("%d\t%d\t%d\t%f\n", gen, i, this.scoreArray[i]["index"], this.scoreArray[i]["score"]));
		}
		return sb.toString();
	}

}


//----------



var basePath="/worksXX/ESMS/zipf-relative-model2/prototype3";

class SimulationActor {

	initialize(selfActor) {
		this.selfActor = selfActor;
		this.childActors = [];
		this.results   = [];
	}

	createChild(ip) {
		this.selfActor.createChild(basePath + "/ScoreActor", {mode: "remote", host: ip})
			.then(childActor => {
				// Save created child actor to instance field.
				this.childActors.push(childActor);
			});
		//console.log("simulation actor: " + this.selfActor.getId());
	}


	async start() {
		console.log(parameter.report());
		
		//-----
		
		console.log("# --- evolution of the scores ---");
		
		let popA = new HaploidPopulation();
		popA.init("normal");
		popA.calcScoreArray();
		console.log(popA.report(0));
		
		for (let gen=1; gen<100; gen++) {
			let popB = popA.propagate();
			
			/* ----- popB.calcScoreArray();  ----- */
			let numOfChildActors = this.childActors.length;
			for (let ind=0; ind<parameter.populationSize ; ind++) {
				let a = popB.individuals[ind].genome.freq;
				this.childActors[ind%numOfChildActors]
					.sendAndReceive("calcScore", a, parameter.numOfGenes)
					.then(reply=>this.results.push(reply));

				while (ind - this.results.length > 100) { // flow control
					await sleep(1000);
				}
			}

			while (this.results.length < parameters.populationSize) {
				await sleep(1000);
			}
			/* ----- ----- */
			
			console.log(popB.report(gen));
			popA = popB;
		}
		
		//-----
		console.log("# --- the last population ---");
		for (let i=0; i<parameter.populationSize; i++) {
			console.log(popA.individuals[i].report(i));
		}

	}

	

	info() {
		console.log("Are you there?");
		console.log(this.children.length);
		this.children.forEach(ch=>console.log(ch.getId()));
	}
 
}

module.exports = SimulationActor;
