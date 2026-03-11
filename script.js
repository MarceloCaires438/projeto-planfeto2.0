// 1. BANCO DE DADOS (Agora busca do LocalStorage ao iniciar)
let entregas = JSON.parse(localStorage.getItem('planfeto_dados')) || [];

// 2. FUNÇÕES DE PERSISTÊNCIA (A Mágica do Salvamento)
function salvarDados() {
    // Transforma o array em texto e salva no navegador
    localStorage.setItem('planfeto_dados', JSON.stringify(entregas));
}

// 3. FUNÇÃO DE LOGIN
function login() {
    const usuario = document.getElementById('user').value;
    const senha = document.getElementById('pass').value;

    if (usuario === "admin" && senha === "123") {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        showPage('dashboard');
    } else {
        alert("Acesso negado, senhor Marcelo.");
    }
}

// 4. NAVEGAÇÃO
function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(s => s.classList.add('hidden'));

    document.getElementById(pageId).classList.remove('hidden');

    if (pageId === 'dashboard') atualizarDashboard();
    if (pageId === 'lista') renderizarTabela();
}

// 5. CADASTRAR NOVA ENTREGA
function addEntrega() {
    const cliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const status = document.getElementById('status').value;

    if (cliente === "" || endereco === "") {
        alert("Preencha tudo corretamente.");
        return;
    }

    const nova = {
        id: Date.now(),
        cliente: cliente,
        endereco: endereco,
        status: status
    };

    entregas.push(nova);
    salvarDados(); // SALVA NO NAVEGADOR

    document.getElementById('cliente').value = "";
    document.getElementById('endereco').value = "";

    alert("Entrega registrada!");
    showPage('lista');
}

// 6. ATUALIZAR STATUS PARA ENTREGUE
function marcarComoEntregue(id) {
    const index = entregas.findIndex(e => e.id === id);
    if (index !== -1) {
        entregas[index].status = "Entregue";
        salvarDados(); // SALVA A ALTERAÇÃO
        renderizarTabela();
        atualizarDashboard();
    }
}

// 7. REMOVER ENTREGA
function removerEntrega(id) {
    if(confirm("Deseja realmente excluir esta entrega?")) {
        entregas = entregas.filter(e => e.id !== id);
        salvarDados(); // SALVA A EXCLUSÃO
        renderizarTabela();
        atualizarDashboard();
    }
}

// 8. ATUALIZAR DASHBOARD
function renderizarTabela() {
    const corpoTabela = document.getElementById('tabela');
    corpoTabela.innerHTML = ""; 

    entregas.forEach(entrega => {
        const classeStatus = entrega.status === "Entregue" ? "ok" : "pendente";
        
        // --- ESTA É A PARTE IMPORTANTE ---
        // Se estiver pendente, cria o botão verde. Se já estiver entregue, fica vazio.
        let botaoEntregar = "";
        if (entrega.status === "Pendente") {
            botaoEntregar = `<button style="background:#22c55e; margin-right:5px; padding: 5px 10px; border-radius: 4px; color: white; border: none; cursor:pointer;" onclick="marcarComoEntregue(${entrega.id})">Entregar</button>`;
        }

        corpoTabela.innerHTML += `
            <tr>
                <td>${entrega.cliente}</td>
                <td>${entrega.endereco}</td>
                <td class="${classeStatus}">${entrega.status}</td>
                <td>
                    ${botaoEntregar}
                    <button style="background:#ef4444; padding: 5px 10px; border-radius: 4px; color: white; border: none; cursor:pointer;" onclick="removerEntrega(${entrega.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// 9. RENDERIZAR TABELA
function renderizarTabela() {
    const corpoTabela = document.getElementById('tabela');
    corpoTabela.innerHTML = ""; 

    entregas.forEach(entrega => {
        const classeStatus = entrega.status === "Entregue" ? "ok" : "pendente";
        
        const botaoConcluir = entrega.status === "Pendente" 
            ? `<button style="background:#22c55e; margin-right:5px; padding: 5px 10px; border-radius: 4px; color: white; border: none; cursor:pointer;" onclick="marcarComoEntregue(${entrega.id})">Entregar</button>` 
            : "";

        corpoTabela.innerHTML += `
            <tr>
                <td>${entrega.cliente}</td>
                <td>${entrega.endereco}</td>
                <td class="${classeStatus}">${entrega.status}</td>
                <td>
                    ${botaoConcluir}
                    <button style="background:#ef4444; padding: 5px 10px; border-radius: 4px; color: white; border: none; cursor:pointer;" onclick="removerEntrega(${entrega.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// 10. BUSCA
function buscar() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = entregas.filter(e => e.cliente.toLowerCase().includes(termo));
    renderizarTabelaFiltrada(filtrados);
}

function renderizarTabelaFiltrada(dados) {
    const corpoTabela = document.getElementById('tabela');
    corpoTabela.innerHTML = "";
    dados.forEach(entrega => {
        const classeStatus = entrega.status === "Entregue" ? "ok" : "pendente";
        corpoTabela.innerHTML += `
            <tr>
                <td>${entrega.cliente}</td>
                <td>${entrega.endereco}</td>
                <td class="${classeStatus}">${entrega.status}</td>
                <td><button onclick="removerEntrega(${entrega.id})">Excluir</button></td>
            </tr>
        `;
    });
}

function logout() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
}
