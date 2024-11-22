import Individuo from "./classes/individuo.mjs";
import Util from "./classes/utils.mjs";

//array de saida
let Asaida = [];

/*
se Asaida[0] igual a true aposta 1% do saldo
se Asaida[1] igual a true aposta 2% do saldo
se Asaida[2] igual a true aposta 5% do saldo
se Asaida[3] igual a true aposta 10% do saldo
*/

// array de input
let input = [];

/*
input[0] vai ser o saldo do individuo em porcentagem. exemplo se o saldo começa com 100 e atualmente está em 90 o input deve ser 90, se está em 120 deve ser 120
os outros 5 indices são um histórico das ultimas 5 rodadas se foi vitorias ou derrota, se vou maior que 1.99 ou menor
*/

const util = new Util();
// pegando os multiplicadores
const multiplicadores = util.getValores();

// definindo os arrays que vão conter os indivíduos, o primeiro vai ser alterado por 1, o segundo por 5 e o terceiro completamente aleatório em todas as gerações
let individuos1 = [];
let individuos2 = [];
let individuos3 = [];

let acabaou = false;

// treinamento vai continuar por 100 gerações.

// o treinamento vai consistir em 100 indivíduos. O melhor vai ser o que demorar mais para perder todo o saldo.

// os indivíduos que ficaram mais de 20 rodadas sem apostar teram o saldo zerado altomaticamente.
// Gerar histórico inicial antes de começar as gerações
const gerarHistoricoInicial = (multiplicadores, tamanhoHistorico) => {
	let historico = [];
	for (let i = 0; i < tamanhoHistorico; i++) {
		historico.push(multiplicadores[i] > 1.99 ? 1 : 0);
	}
	return historico;
};

// Configuração inicial de histórico
const tamanhoHistorico = 10; // Número de rodadas no histórico // sempre - 1 em relação a entrada
let historicoInicial = gerarHistoricoInicial(multiplicadores, tamanhoHistorico);

// Treinamento por 100 gerações
const geracoes = 10;
const maxRodadas = 50; // Número de rodadas baseando-se no tamanho do array de multiplicadores
const quantosIndividuos = 10000;
const maxVesesSemApostar = 25;
// definindo as constantes da rede neural
const entrada = 11;
const layers = 3;
const saida = 4;

// Definindo os primeiros 1000 indivíduos, que são 50%, 25% e 25%
for (let i = 0; i < quantosIndividuos * 0.5; i++) {
	individuos1[i] = new Individuo(100.0, entrada, layers, saida);
}
for (let i = 0; i < quantosIndividuos * 0.25; i++) {
	individuos2[i] = new Individuo(100.0, entrada, layers, saida);
}
for (let i = 0; i < quantosIndividuos * 0.25; i++) {
	individuos3[i] = new Individuo(100.0, entrada, layers, saida);
}

// Variável para armazenar os pesos do melhor indivíduo
let melhoresPesos = null;

let indice = 0;

console.time("Total");
// Atualização do input dentro das gerações
for (let geracao = 0; geracao < geracoes; geracao++) {
	console.log(`Iniciando geração ${geracao + 1}`);
	console.time("Geração");
	for (let rodada = 0; rodada < maxRodadas; rodada++) {
		const multiplicador = multiplicadores[indice];

		[individuos1, individuos2, individuos3].forEach((grupo) => {
			grupo.forEach((individuo) => {
				if (!individuo.Bvivo) return;

				// Atualizar o input
				input[0] = individuo.saldo; // Saldo atual em porcentagem
				for (let i = 0; i < tamanhoHistorico; i++) {
					input[i + 1] = historicoInicial[i]; // Preenche o histórico
				}

				// Passar o input para a rede neural e obter a saída
				Asaida = individuo.rede.iniciar(input);

				// Determinar a aposta
				let aposta = 0;
				if (Asaida[0]) aposta = individuo.saldo * 0.01;
				if (Asaida[1]) aposta = individuo.saldo * 0.02;
				if (Asaida[2]) aposta = individuo.saldo * 0.05;
				if (Asaida[3]) aposta = individuo.saldo * 0.1;

				// Se não apostar, conta como rodada sem aposta
				if (aposta === 0) {
					individuo.quantidadeDeVezesSemApostar++;
					if (individuo.quantidadeDeVezesSemApostar >= maxVesesSemApostar) {
						individuo.saldo = 0;
						individuo.Bvivo = false;
					}
					return;
				}

				// Registrar aposta
				individuo.quantidadeDeVezesSemApostar = 0;
				individuo.quantasApostasFez++;
				individuo.saldo -= aposta;

				// Verificar o resultado
				const ganhou = multiplicador > 1.99;
				if (ganhou) {
					individuo.saldo += aposta * 2;
				}

				if (individuo.saldo <= 0) {
					individuo.Bvivo = false;
				}

				// Atualizar o histórico dinamicamente
				historicoInicial.shift(); // Remove o item mais antigo
				historicoInicial.push(ganhou ? 1 : 0); // Adiciona o resultado atual
			});
		});
		indice++;
	}
	console.timeEnd("Geração");

	const melhorIndividuo = [...individuos1, ...individuos2, ...individuos3].reduce((melhor, atual) => {
		// Filtrar somente os indivíduos vivos
		if (!atual.Bvivo) return melhor;

		// Nova métrica para avaliação: saldo ponderado pelas apostas feitas
		const scoreAtual = atual.saldo + atual.quantasApostasFez * 0.1;

		return scoreAtual > (melhor?.score || 0) ? { ...atual, score: scoreAtual } : melhor;
	}, null);

	if (melhorIndividuo) {
		melhoresPesos = melhorIndividuo.rede.getPesos(); // Salvar os pesos do melhor indivíduo
		console.log(`Melhor indivíduo da geração ${geracao + 1}: Saldo = ${melhorIndividuo.saldo}`);
	}

	// Ajustar os pesos para a próxima geração
	individuos1.forEach((individuo) => {
		individuo.rede.carregarPesos(melhoresPesos); // Usar os pesos do melhor indivíduo
		individuo.rede.modificarPesos(1); // Pequeno ajuste
		individuo.saldo = 100.0;
	});

	individuos2.forEach((individuo) => {
		individuo.rede.carregarPesos(melhoresPesos); // Usar os pesos do melhor indivíduo
		individuo.rede.modificarPesos(5); // Ajuste moderado
		individuo.saldo = 100.0;
	});

	individuos3.forEach((individuo) => {
		individuo.rede.gerarPesos(); // Regenerar pesos aleatoriamente
		individuo.saldo = 100.0;
	});
}

console.log("Treinamento concluído!");
console.timeEnd("Total");
