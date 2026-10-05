const API_URL = 'http://localhost:3000/api';
const form = document.querySelector('#form-evento');
const campoPalestrante = document.querySelector('#palestranteId');
const mensagem = document.querySelector('#mensagem');

async function carregarPalestrantes() {
	try {
		const resposta = await fetch(`${API_URL}/palestrante`);
		if (!resposta.ok) {
			throw new Error('Não foi possível carregar os palestrantes.');
		}

		const palestrantes = await resposta.json();
		campoPalestrante.replaceChildren(new Option('Selecione um palestrante', ''));

		for (const palestrante of palestrantes) {
			campoPalestrante.add(new Option(palestrante.nome, palestrante.id));
		}

		if (palestrantes.length === 0) {
			mensagem.textContent = 'Cadastre um palestrante antes de criar um evento.';
		}
	} catch (erro) {
		mensagem.textContent = erro instanceof TypeError
			? 'Não foi possível conectar à API. Inicie o backend na porta 3000.'
			: erro.message;
		campoPalestrante.replaceChildren(new Option('Falha ao carregar palestrantes', ''));
	}
}

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	mensagem.textContent = 'Cadastrando evento...';

	const dados = Object.fromEntries(new FormData(form));
	dados.palestranteId = Number(dados.palestranteId);

	try {
		const resposta = await fetch(`${API_URL}/evento`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dados)
		});

		if (!resposta.ok) {
			const erro = await resposta.json().catch(() => null);
			throw new Error(erro?.error || 'Não foi possível cadastrar o evento.');
		}

		form.reset();
		mensagem.textContent = 'Evento cadastrado com sucesso.';
	} catch (erro) {
		mensagem.textContent = erro instanceof TypeError
			? 'Não foi possível conectar à API. Inicie o backend na porta 3000.'
			: erro.message;
	}
});

carregarPalestrantes();
