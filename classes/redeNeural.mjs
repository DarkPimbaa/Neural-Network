//imports
import Utils from "./utils.mjs"; // contem funções úteis
import Big from "big.js";

export default class RedeNeural {
	/** Cria uma rede neural completa
	 * @param {int} entrada quantos neurônios de entrada vão ter
	 * @param {int} layers quantos layers de neurônios ocultos vão ter
	 * @param {int} saida quantos neurônios de saida vão ter
	 */
	constructor(entrada, layers, saida) {
		/** Estrutura interna
		 * @var neuronios[0] = layer de inputs.
		 *
		 * O ultimo layer é o layer de outputs
		 *
		 * Usar neuronios.length para saber qual é o indice do ultimo layer
		 */
		this.neuronios = [];
		this.entrada = entrada; // quantidade de neurônios de input
		this.layers = layers; // quantidade de layers ocultos
		this.saida = saida; // quantidade de neurônios de output
		this.utils = new Utils();
	}

	// MÉTODOS PRINCIPAIS INICIO ---------------------------------------------------------------

	/** Gera os pesos de todos os neurônios de forma aleatória */
	gerarPesos() {
		// percorre todos os layers
		for (let index = 0; index < this.layers + 1; index++) {
			// gera valores padrão e pesos aleatórios para todos os neurônios
			this.neuronios[index] = [];
			for (let i = 0; i < this.entrada; i++) {
				this.neuronios[index][i] = { valor: new Big(0.0), pesos: this.geraArrayDePesos(this.entrada) };
			}
		}
	}

	/** Carrega os neuronios a partir de um array que segue a mesma estrutura
	 * @param {[]} neuronios
	 * @returns {boolean} retorna true se carregou com sucesso, false se ouver falha.
	 */
	carregarPesos(neuronios) {
		this.neuronios = neuronios;
		return true;
	}

	/** Modifica os pesos pelo nível, exemplo: nível = 5 todos os pesos vão somar -5 ou 5 aleatóriamente
	 * @param {int} nivel
	 */
	modificarPesos(nivel) {
		// layer
		for (let index = 0; index < this.layers + 1; index++) {
			// neurônios
			for (let i = 0; i < this.entrada; i++) {
				// pesos
				for (let indexx = 0; indexx < this.neuronios[0][0].pesos.length; indexx++) {
					this.neuronios[index][i].pesos[indexx] = this.neuronios[index][i].pesos[indexx] + this.aleatorioSinal(nivel);
				}
			}
		}
	}

	/**
	 * @returns {neuronios []}
	 */
	getPesos() {
		return JSON.parse(JSON.stringify(this.neuronios));
	}

	/** Inicia a rede neural
	 * @param {Decimal []} inputs array com os valores de input
	 * @returns {boolean []} array de true's e false's
	 */
	iniciar(inputs) {
		let saida = [];
		// aplica os inputs em todos os neurônios de input
		for (let i = 0; i < this.entrada; i++) {
			this.neuronios[0][i].valor = new Big(inputs[i]);
		}

		// Calcula o valor dos neurônios anteiores multiplicados pelos pesos.
		//layer
		for (let i = 1; i < this.layers + 1; i++) {
			//neurônio
			for (let index = 0; index < this.entrada; index++) {
				this.neuronios[i][index].valor = new Big(this.calcularOcultos(i, index));
			}
		}

		// vai percorrer os neuronios anteriores aos de saida
		for (let i = 0; i < this.saida; i++) {
			saida[i] = this.calcularSaida(i);
		}
		return saida;
	}

	// MÉTODOS PRINCIPAIS FIM ------------------------------------------------------------------

	// MÉTODOS COMPLEMENTARES

	/** Gera um array de pesos com valores entre -1000 e 1000
	 * @param { int } entrada define o tamanho do array
	 */
	geraArrayDePesos() {
		let array = [];
		for (let i = 0; i < this.entrada; i++) {
			array[i] = this.utils.gerarNumeroAleatorio();
		}
		return array;
	}

	/** usada no método
	 * @method modificarPesos()
	 * @returns {int}
	 */
	aleatorioSinal(num) {
		// Gera um número aleatório entre 0 e 1 para decidir se retorna 0
		if (Math.random() < 0.5) {
			return 0; // 50% de chance de retornar 0
		}
		// Gera outro número aleatório entre 0 e 1 para determinar o sinal
		let random = Math.random();
		return random < 0.5 ? -num : num;
	}

	/** Função que calcula o valor dos neurônios ocultos
	 * @param {int} i layer
	 * @param {int} index indice do peso que deve ser multiplicado em cada neurônio anterior
	 */
	calcularOcultos(i, index) {
		let valor = 0.0;
		i = i - 1;
		for (let indexx = 0; indexx < this.entrada; indexx++) {
			valor = valor + this.neuronios[i][indexx].valor * this.neuronios[i][indexx].pesos[index];
		}

		// se o valor for menor que zero retorna 0,
		if (valor <= 0) {
			valor = 0;
		}

		return valor;
	}

	/** calcula o valor dos neurônios de saida
	 * @returns {boolean} retorna true se o resultado for positivo
	 */
	calcularSaida(index) {
		let valor = 0.0;
		for (let i = 0; i < this.entrada; i++) {
			valor = valor + this.neuronios[this.neuronios.length - 1][i].valor * this.neuronios[this.neuronios.length - 1][i].pesos[index];
		}

		if (valor <= 0) {
			return false;
		} else if (valor > 0) {
			return true;
		}
	}
}
