export default class Util {
	constructor() {}

	/** Função que gera um número aleatório entre -1000 e 1000 */
	gerarNumeroAleatorio() {
		return Math.floor(Math.random() * 2001) - 1000;
	}

	/** Função que gera um número aleatório entre 0.0 e 100.0 */
	gerarNumeroAleatorio0a100() {
		return Math.random() * 100;
	}
}
