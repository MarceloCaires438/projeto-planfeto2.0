// Banco de dados em memória (inicia vazio)
let entregas = [];

// 1. FUNÇÃO DE LOGIN
function login() {
    // Captura os valores dos inputs
    const usuario = document.getElementById('user').value;
    const senha = document.getElementById('pass').value;

    // Verificação simples (usuário: admin / senha: 123)
    if (usuario === "admin" && senha === "123") {
        
        // A MÁGICA ACONTECE AQUI:
        // Esconde a tela de login
        document.getElementById('login').classList.add('hidden');
        
        // Mostra a div do sistema
        document.getElementById('app').classList.remove('hidden');
        
        // Garante que a primeira página a aparecer seja o Dashboard
        showPage('dashboard');
        
    } else {
        alert("Usuário ou senha inválidos! Tente admin / 123");
    }
}

// 2. FUNÇÃO DE NAVEGAÇÃO ENTRE ABAS
function showPage(pageId) {
    // Primeiro, selecionamos todas as seções de conteúdo
    const sections = document.querySelectorAll('main section');
    
    // Escondemos todas elas
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    // Removemos o 'hidden' apenas da seção que queremos ver
    const targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

// 3. FUNÇÃO DE LOGOUT (VOLTAR PARA O LOGIN)
function logout() {
    // Inverte o processo do login
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
    
    // Limpa os campos de texto por segurança
    document.getElementById('user').value = "";
    document.getElementById('pass').value = "";
}

// 3. ADICIONAR NOVA ENTREGA
function addEntrega() {
    const cliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const status = document.getElementById('status').value;

    if (cliente === "" || endereco === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const novaEntrega = {
        id: Date.now(),
        cliente: cliente,
        endereco: endereco,
        status: status
    };

    entregas.push(novaEntrega);
    
    // Limpa os campos
    document.getElementById('cliente').value = "";
    document.getElementById('endereco').value = "";
    
    alert("Entrega cadastrada com sucesso!");
    showPage('lista'); // Redireciona para a lista
}

// 4. ATUALIZAR DASHBOARD (CARDS)
function atualizarDashboard() {
    const total = entregas.length;
    const pendentes = entregas.filter(e => e.status === "Pendente").length;
    const entregues = entregas.filter(e => e.status === "Entregue").length;

    document.getElementById('total').innerText = total;
    document.getElementById('pendentes').innerText = pendentes;
    document.getElementById('entregues').innerText = entregues;
}

// 5. RENDERIZAR TABELA DE ENTREGAS
function renderizarTabela(dadosParaExibir = entregas) {
    const tabela = document.getElementById('tabela');
    tabela.innerHTML = "";

    dadosParaExibir.forEach((entrega, index) => {
        const classeStatus = entrega.status.toLowerCase() === "entregue" ? "ok" : "pendente";
        
        tabela.innerHTML += `
            <tr>
                <td>${entrega.cliente}</td>
                <td>${entrega.endereco}</td>
                <td class="${classeStatus}">${entrega.status}</td>
                <td>
                    <button style="background: #ef4444; padding: 5px 10px;" onclick="removerEntrega(${entrega.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// 6. BUSCA FILTRADA
function buscar() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = entregas.filter(e => 
        e.cliente.toLowerCase().includes(termo) || 
        e.endereco.toLowerCase().includes(termo)
    );
    renderizarTabela(filtrados);
}

// 7. REMOVER ENTREGA
function removerEntrega(id) {
    entregas = entregas.filter(e => e.id !== id);
    renderizarTabela();
    atualizarDashboard();
}

// 8. LOGOUT
function logout() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
}
