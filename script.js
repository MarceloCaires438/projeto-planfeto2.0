// 1. BANCO DE DADOS EM MEMÓRIA
let entregas = [];

// 2. FUNÇÃO DE LOGIN
function login() {
    const usuario = document.getElementById('user').value;
    const senha = document.getElementById('pass').value;

    if (usuario === "admin" && senha === "123") {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        showPage('dashboard');
    } else {
        alert("Acesso negado, senhor Marcelo. Verifique o usuário e senha.");
    }
}

// 3. NAVEGAÇÃO ENTRE ABAS
function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(s => s.classList.add('hidden'));

    document.getElementById(pageId).classList.remove('hidden');

    // Sempre que abrir Dashboard ou Lista, atualizamos os dados visuais
    if (pageId === 'dashboard') atualizarDashboard();
    if (pageId === 'lista') renderizarTabela();
}

// 4. CADASTRAR NOVA ENTREGA
function addEntrega() {
    const cliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const status = document.getElementById('status').value;

    if (cliente === "" || endereco === "") {
        alert("Por favor, preencha todos os campos da entrega.");
        return;
    }

    // Criamos um objeto para a entrega
    const nova = {
        id: Date.now(), // Gera um ID único baseado no tempo
        cliente: cliente,
        endereco: endereco,
        status: status
    };

    // Adiciona na lista
    entregas.push(nova);

    // Limpa os campos para o próximo cadastro
    document.getElementById('cliente').value = "";
    document.getElementById('endereco').value = "";

    alert("Entrega de " + cliente + " registada!");
    showPage('lista'); // Leva o usuário para ver a lista após cadastrar
}

// 5. ATUALIZAR OS CARDS DO DASHBOARD
function atualizarDashboard() {
    const total = entregas.length;
    const pendentes = entregas.filter(e => e.status === "Pendente").length;
    const entregues = entregas.filter(e => e.status === "Entregue").length;

    document.getElementById('total').innerText = total;
    document.getElementById('pendentes').innerText = pendentes;
    document.getElementById('entregues').innerText = entregues;
}

// 6. RENDERIZAR (DESENHAR) A TABELA
function renderizarTabela() {
    const corpoTabela = document.getElementById('tabela');
    corpoTabela.innerHTML = ""; // Limpa a tabela antes de desenhar

    entregas.forEach(entrega => {
        // Define a cor do status baseado no texto
        const classeStatus = entrega.status === "Entregue" ? "ok" : "pendente";

        corpoTabela.innerHTML += `
            <tr>
                <td>${entrega.cliente}</td>
                <td>${entrega.endereco}</td>
                <td class="${classeStatus}">${entrega.status}</td>
                <td>
                    <button style="background:#ef4444; padding:5px;" onclick="removerEntrega(${entrega.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// 7. BUSCA EM TEMPO REAL
function buscar() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = entregas.filter(e => 
        e.cliente.toLowerCase().includes(termo)
    );
    
    // Renderiza apenas os filtrados
    const corpoTabela = document.getElementById('tabela');
    corpoTabela.innerHTML = "";
    filtrados.forEach(entrega => {
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

// 8. REMOVER ENTREGA
function removerEntrega(id) {
    entregas = entregas.filter(e => e.id !== id);
    renderizarTabela();
}

// 9. LOGOUT
function logout() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
}
