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

	/** Modifica os pesos para serem a média dos pesos de várias redes fornecidas
	 * @param {RedeNeural[]} redes Array de outras instâncias de Redes Neurais para calcular a média dos pesos.
	 */
	modificarPesos(redes) {
		// Verifica se há redes para processar
		if (!redes || redes.length === 0) {
			throw new Error("O array de redes fornecido está vazio ou inválido.");
		}

		// Percorre cada layer
		for (let layerIndex = 0; layerIndex < this.layers + 1; layerIndex++) {
			// Percorre cada neurônio no layer
			for (let neuronIndex = 0; neuronIndex < this.entrada; neuronIndex++) {
				// Percorre cada peso do neurônio
				for (let pesoIndex = 0; pesoIndex < this.neuronios[layerIndex][neuronIndex].pesos.length; pesoIndex++) {
					// Calcula a média dos pesos do peso atual
					let somaPesos = 0;
					for (let rede of redes) {
						somaPesos += rede.neuronios[layerIndex][neuronIndex].pesos[pesoIndex];
					}
					const media = somaPesos / redes.length;

					// Atualiza o peso com a média
					this.neuronios[layerIndex][neuronIndex].pesos[pesoIndex] = media;
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
