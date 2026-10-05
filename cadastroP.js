const API_URL = 'http://localhost:3000/api/palestrante';
const form = document.querySelector('#form-palestrante');
const mensagem = document.querySelector('#mensagem');

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	mensagem.textContent = 'Cadastrando palestrante...';

	const dados = Object.fromEntries(new FormData(form));

	try {
		const resposta = await fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dados)
		});

		if (!resposta.ok) {
			const erro = await resposta.json().catch(() => null);
			throw new Error(erro?.error || 'Não foi possível cadastrar o palestrante.');
		}

		form.reset();
		mensagem.textContent = 'Palestrante cadastrado com sucesso.';
	} catch (erro) {
		mensagem.textContent = erro instanceof TypeError
			? 'Não foi possível conectar à API. Inicie o backend na porta 3000.'
			: erro.message;
	}
});
