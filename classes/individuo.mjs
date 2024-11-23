import RedeNeural from "./redeNeural.mjs";
/** Cria um indivíduo com uma rede neural já iniciada */
export default class Individuo {
	constructor(saldoInicial, entrada, layers, saida) {
		this.saldoInicial = saldoInicial;
		this.saldo = saldoInicial;
		this.Bvivo = true;
		this.quantidadeDeVezesSemApostar = 0;
		this.quantasApostasFez = 0;
		this.rede = new RedeNeural(entrada, layers, saida);
		this.rede.gerarPesos();
	}
}
