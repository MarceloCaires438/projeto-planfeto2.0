// 1. CARREGAR DADOS DO NAVEGADOR
let entregas = JSON.parse(localStorage.getItem('planfeto_db')) || [];

// 2. FUNÇÃO DE LOGIN
function login() {
    const usuario = document.getElementById('user').value;
    const senha = document.getElementById('pass').value;

    if (usuario === "admin" && senha === "123") {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        // Atualiza tudo ao entrar
        atualizarDashboard();
        showPage('dashboard');
    } else {
        alert("Usuário ou senha incorretos, senhor Marcelo.");
    }
}

// 3. NAVEGAÇÃO ENTRE TELAS
function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(s => s.classList.add('hidden'));

    document.getElementById(pageId).classList.remove('hidden');

    // Atualiza os dados sempre que trocar de tela
    atualizarDashboard();
    if (pageId === 'lista') renderizarTabela();
}

// 4. SALVAR NO NAVEGADOR
function salvarNoStorage() {
    localStorage.setItem('planfeto_db', JSON.stringify(entregas));
}

let map; // Variável global para o mapa

function initMap() {
    // Se o mapa já existir, não cria de novo
    if (map) return;

    // Coordenadas centrais (Região de Guariba/Taquaritinga)
    map = L.map('map').setView([-21.3601, -48.4111], 10); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Adiciona marcadores para cada entrega que você já cadastrou
    renderizarPinsNoMapa();
}

function renderizarPinsNoMapa() {
    // Limpa marcadores antigos se necessário e adiciona os novos
    entregas.forEach(entrega => {
        // Exemplo: Como não temos latitude/longitude real no formulário ainda,
        // aqui você poderia usar uma API de Geocoding ou fixar pontos de teste.
        // Vou colocar um marcador de exemplo em Taquaritinga para teste:
        L.marker([-21.4056, -48.5042]).addTo(map)
            .bindPopup(`<b>Cliente:</b> ${entrega.cliente}<br><b>Status:</b> ${entrega.status}`);
    });
}

// Atualize sua função showPage para carregar o mapa quando clicar no botão
function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(s => s.classList.add('hidden'));

    document.getElementById(pageId).classList.remove('hidden');

    if (pageId === 'mapa-rastreio') {
        setTimeout(() => {
            initMap();
            map.invalidateSize(); // Corrige erro de renderização do Leaflet em abas escondidas
        }, 200);
    }
    
    atualizarDashboard();
}

// 5. CADASTRAR NOVA ENTREGA
function addEntrega() {
    const cliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const status = document.getElementById('status').value;

    if (!cliente || !endereco) {
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
    salvarNoStorage();
    
    // Limpa os campos
    document.getElementById('cliente').value = "";
    document.getElementById('endereco').value = "";

    alert("Entrega de " + cliente + " cadastrada!");
    showPage('dashboard'); // Volta para o painel para ver o número atualizar
}

// 6. ATUALIZAR NÚMEROS DO PAINEL (DASHBOARD)
function atualizarDashboard() {
    const total = entregas.length;
    // O filter deve bater exatamente com os "values" do select no HTML
    const pendentes = entregas.filter(e => e.status === "Pendente").length;
    const entregues = entregas.filter(e => e.status === "Entregue").length;

    // Injeta os valores nas tags h3
    document.getElementById('total').innerText = total;
    document.getElementById('pendentes').innerText = pendentes;
    document.getElementById('entregues').innerText = entregues;
}

// 7. RENDERIZAR TABELA NA TELA DE ENTREGAS
function renderizarTabela() {
    const tabela = document.getElementById('tabela');
    tabela.innerHTML = "";

    entregas.forEach(entrega => {
        const classeStatus = entrega.status === "Entregue" ? "ok" : "pendente";
        
        // Botão de "Entregar" só aparece se estiver pendente
        let btnEntregar = "";
        if (entrega.status === "Pendente") {
            btnEntregar = `<button style="background:#22c55e; margin-right:5px; padding:5px 10px; border-radius:4px; color:white; border:none; cursor:pointer;" onclick="marcarEntregue(${entrega.id})">Entregar</button>`;
        }

        tabela.innerHTML += `
            <tr>
                <td>${entrega.cliente}</td>
                <td>${entrega.endereco}</td>
                <td class="${classeStatus}">${entrega.status}</td>
                <td>
                    ${btnEntregar}
                    <button style="background:#ef4444; padding:5px 10px; border-radius:4px; color:white; border:none; cursor:pointer;" onclick="excluirEntrega(${entrega.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// 8. MARCAR COMO ENTREGUE
function marcarEntregue(id) {
    const index = entregas.findIndex(e => e.id === id);
    if (index !== -1) {
        entregas[index].status = "Entregue";
        salvarNoStorage();
        renderizarTabela();
        atualizarDashboard();
    }
}

// 9. EXCLUIR ENTREGA
function excluirEntrega(id) {
    if(confirm("Deseja excluir este registro?")) {
        entregas = entregas.filter(e => e.id !== id);
        salvarNoStorage();
        renderizarTabela();
        atualizarDashboard();
    }
}

// 10. BUSCA
function buscar() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = entregas.filter(e => e.cliente.toLowerCase().includes(termo));
    
    const tabela = document.getElementById('tabela');
    tabela.innerHTML = "";
    filtrados.forEach(entrega => {
        const classeStatus = entrega.status === "Entregue" ? "ok" : "pendente";
        tabela.innerHTML += `
            <tr>
                <td>${entrega.cliente}</td>
                <td>${entrega.endereco}</td>
                <td class="${classeStatus}">${entrega.status}</td>
                <td><button onclick="excluirEntrega(${entrega.id})">Excluir</button></td>
            </tr>
        `;
    });
}

// 11. SAIR
function logout() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
}
