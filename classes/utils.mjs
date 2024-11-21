import fs from "fs";
import { deserialize } from "v8";

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

	/** retorna os valores em formato de array
	 * @returns {valores []}
	 */
	getValores(caminhoArquivo = "./valores.bin") {
		try {
			// Ler o arquivo binário
			const binario = fs.readFileSync(caminhoArquivo);

			// Desserializar o binário para obter o array
			const array = deserialize(binario);

			// Retornar o array
			return array;
		} catch (erro) {
			console.error("Erro ao carregar ou processar os dados binários:", erro);
			throw erro;
		}
	}
}
