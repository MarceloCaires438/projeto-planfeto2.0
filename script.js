let entregas = JSON.parse(localStorage.getItem('planfeto_db')) || [];
let map;

function login() {
    const usuario = document.getElementById('user').value;
    const senha = document.getElementById('pass').value;
    if (usuario === "admin" && senha === "123") {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        showPage('dashboard');
    } else {
        alert("Erro no login, senhor Marcelo.");
    }
}

function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(s => s.classList.add('hidden'));
    
    document.getElementById(pageId).classList.remove('hidden');

    // ESTA PARTE É ESSENCIAL:
    if (pageId === 'dashboard') atualizarDashboard();
    if (pageId === 'lista') renderizarTabela(); // Chama a função aqui!
    
    if (pageId === 'mapa-rastreio') {
        setTimeout(() => {
            initMap();
            if(map) map.invalidateSize();
        }, 300);
    }
}

async function addEntrega() {
    const cliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const status = document.getElementById('status').value;
    const fotoInput = document.getElementById('foto');

    if (!cliente || !endereco) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    let fotoBase64 = "";

    // Lógica para converter imagem em Base64
    if (fotoInput.files && fotoInput.files[0]) {
        const file = fotoInput.files[0];
        // Opcional: Validar tamanho (ex: max 2MB) pois localStorage tem limite de ~5MB
        if (file.size > 2 * 1024 * 1024) {
            alert("A foto é muito grande! Tente uma menor que 2MB.");
            return;
        }
        fotoBase64 = await toBase64(file);
    }

    const nova = { 
        id: Date.now(), 
        cliente, 
        endereco, 
        status, 
        foto: fotoBase64 // Salvando a imagem aqui
    };

    entregas.push(nova);
    localStorage.setItem('planfeto_db', JSON.stringify(entregas));

    // Limpeza e Redirecionamento
    document.getElementById('cliente').value = "";
    document.getElementById('endereco').value = "";
    document.getElementById('foto').value = "";

    alert("Cadastrado com sucesso!");
    showPage('lista');
}

// Função auxiliar para converter arquivo em Base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function atualizarDashboard() {
    document.getElementById('total').innerText = entregas.length;
    document.getElementById('pendentes').innerText = entregas.filter(e => e.status === "Pendente").length;
    document.getElementById('entregues').innerText = entregas.filter(e => e.status === "Entregue").length;
}

function renderizarTabela() {
    const tabela = document.getElementById('tabela');
    tabela.innerHTML = "";
    entregas.forEach(e => {
        const classe = e.status === "Entregue" ? "ok" : "pendente";
        let btnEntregar = e.status === "Pendente" ? `<button style="background:#22c55e; color:white; border:none; padding:5px; margin-right:5px; border-radius:4px;" onclick="marcarEntregue(${e.id})">Entregar</button>` : "";
        
        tabela.innerHTML += `
            <tr>
                <td>${e.cliente}</td>
                <td>${e.endereco}</td>
                <td class="${classe}">${e.status}</td>
                <td>
                    ${btnEntregar}
                    <button style="background:#ef4444; color:white; border:none; padding:5px; border-radius:4px;" onclick="excluir(${e.id})">Excluir</button>
                </td>
            </tr>`;
    });
}

function marcarEntregue(id) {
    const i = entregas.findIndex(e => e.id === id);
    entregas[i].status = "Entregue";
    localStorage.setItem('planfeto_db', JSON.stringify(entregas));
    renderizarTabela();
    atualizarDashboard();
}

function excluir(id) {
    entregas = entregas.filter(e => e.id !== id);
    localStorage.setItem('planfeto_db', JSON.stringify(entregas));
    renderizarTabela();
}

function initMap() {
    if (map) return;
    map = L.map('map').setView([-21.3601, -48.4111], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

function logout() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
}
