const API_URL = 'http://localhost:3000/api';
const listaEventos = document.querySelector('#eventos-lista');
const mensagem = document.querySelector('#mensagem');
const dialogo = document.querySelector('#dialog-edicao');
const formEdicao = document.querySelector('#form-edicao-evento');
const campoPalestrante = document.querySelector('#edicao-palestrante');
let palestrantes = [];
let eventoEmEdicao;

function adicionarInformacao(card, rotulo, valor) {
	const linha = document.createElement('div');
	const titulo = document.createElement('span');
	const texto = document.createElement('span');
	titulo.className = 'titulo';
	titulo.textContent = `${rotulo}: `;
	texto.textContent = valor;
	linha.append(titulo, texto);
	card.append(linha);
}

function dataParaCampo(valor) {
	const data = new Date(valor);
	data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
	return data.toISOString().slice(0, 16);
}

function criarCard(evento) {
	const card = document.createElement('article');
	const botoes = document.createElement('div');
	const botaoEditar = document.createElement('button');
	const botaoExcluir = document.createElement('button');
	const palestrante = evento.palestrantes?.map((item) => item.nome).join(', ') || 'Não informado';

	card.className = 'card';
	adicionarInformacao(card, 'NOME', evento.nome);
	adicionarInformacao(card, 'DESCRIÇÃO', evento.descricao);
	adicionarInformacao(card, 'LOCAL', evento.local);
	adicionarInformacao(card, 'DATA', new Date(evento.data).toLocaleString('pt-BR'));
	adicionarInformacao(card, 'PALESTRANTE', palestrante);

	botoes.className = 'botoes';
	botaoEditar.type = 'button';
	botaoEditar.className = 'botao';
	botaoEditar.textContent = 'EDITAR';
	botaoEditar.addEventListener('click', () => abrirEdicao(evento));
	botaoExcluir.type = 'button';
	botaoExcluir.className = 'botao';
	botaoExcluir.textContent = 'EXCLUIR';
	botaoExcluir.addEventListener('click', () => excluirEvento(evento));
	botoes.append(botaoEditar, botaoExcluir);
	card.append(botoes);
	return card;
}

async function carregarEventos() {
	mensagem.textContent = 'Carregando eventos...';
	listaEventos.replaceChildren();

	try {
		const resposta = await fetch(`${API_URL}/evento`);
		if (!resposta.ok) {
			throw new Error('Não foi possível carregar os eventos.');
		}

		const eventos = await resposta.json();
		for (const evento of eventos) {
			listaEventos.append(criarCard(evento));
		}
		mensagem.textContent = eventos.length ? '' : 'Ainda não há eventos cadastrados.';
	} catch (erro) {
		mensagem.textContent = erro instanceof TypeError
			? 'Não foi possível conectar à API. Inicie o backend na porta 3000.'
			: erro.message;
	}
}

async function abrirEdicao(evento) {
	eventoEmEdicao = evento;
	document.querySelector('#edicao-nome').value = evento.nome;
	document.querySelector('#edicao-descricao').value = evento.descricao;
	document.querySelector('#edicao-local').value = evento.local;
	document.querySelector('#edicao-data').value = dataParaCampo(evento.data);
	campoPalestrante.replaceChildren(new Option('Selecione um palestrante', ''));

	if (palestrantes.length === 0) {
		try {
			const resposta = await fetch(`${API_URL}/palestrante`);
			if (!resposta.ok) throw new Error('Não foi possível carregar os palestrantes.');
			palestrantes = await resposta.json();
		} catch (erro) {
			mensagem.textContent = erro.message;
			return;
		}
	}

	for (const palestrante of palestrantes) {
		campoPalestrante.add(new Option(palestrante.nome, palestrante.id));
	}
	campoPalestrante.value = String(evento.palestrantes?.[0]?.id ?? '');
	dialogo.showModal();
}

async function excluirEvento(evento) {
	if (!window.confirm(`Excluir o evento "${evento.nome}"?`)) return;

	try {
		const resposta = await fetch(`${API_URL}/evento/${evento.id}`, { method: 'DELETE' });
		if (!resposta.ok) throw new Error('Não foi possível excluir o evento.');
		await carregarEventos();
	} catch (erro) {
		mensagem.textContent = erro instanceof TypeError
			? 'Não foi possível conectar à API. Inicie o backend na porta 3000.'
			: erro.message;
	}
}

formEdicao.addEventListener('submit', async (event) => {
	event.preventDefault();
	const dados = Object.fromEntries(new FormData(formEdicao));
	dados.palestranteId = Number(dados.palestranteId);

	try {
		const resposta = await fetch(`${API_URL}/evento/${eventoEmEdicao.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dados)
		});
		if (!resposta.ok) throw new Error('Não foi possível atualizar o evento.');
		dialogo.close();
		await carregarEventos();
	} catch (erro) {
		mensagem.textContent = erro instanceof TypeError
			? 'Não foi possível conectar à API. Inicie o backend na porta 3000.'
			: erro.message;
	}
});

document.querySelector('#cancelar-edicao').addEventListener('click', () => dialogo.close());

carregarEventos();
