let entregaPendenteId = null; // Guarda qual entrega está sendo finalizada

// 1. Abre o modal quando clica no botão verde "Entregar" da tabela
function marcarEntregue(id) {
    entregaPendenteId = id; // Salva o ID da entrega selecionada
    document.getElementById('modalFoto').classList.remove('hidden');
}

// 2. Fecha o modal se desistir
function fecharModal() {
    document.getElementById('modalFoto').classList.add('hidden');
    document.getElementById('fotoEntrega').value = "";
    entregaPendenteId = null;
}

// 3. Processa a foto e finaliza a entrega
async function confirmarEntregaComFoto() {
    const fotoInput = document.getElementById('fotoEntrega');
    
    if (!fotoInput.files || !fotoInput.files[0]) {
        alert("Senhor Marcelo, é obrigatório tirar a foto para comprovar a entrega!");
        return;
    }

    const file = fotoInput.files[0];
    const fotoBase64 = await toBase64(file);

    // Localiza a entrega no array e atualiza
    const index = entregas.findIndex(e => e.id === entregaPendenteId);
    if (index !== -1) {
        entregas[index].status = "Entregue";
        entregas[index].foto = fotoBase64; // A foto entra AQUI agora
        
        localStorage.setItem('planfeto_db', JSON.stringify(entregas));
        
        alert("Entrega concluída com sucesso!");
        fecharModal();
        renderizarTabela();
        atualizarDashboard();
    }
}

// Função auxiliar para converter imagem
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
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
        
        // Se já entregou, mostra botão da foto. Se não, mostra botão de entregar.
        let acaoPrincipal = "";
        if (e.status === "Pendente") {
            acaoPrincipal = `<button style="background:#22c55e; color:white; border:none; padding:8px; margin-right:5px; border-radius:4px; cursor:pointer;" onclick="marcarEntregue(${e.id})">Entregar</button>`;
        } else if (e.foto) {
            acaoPrincipal = `<button style="background:#3b82f6; color:white; border:none; padding:8px; margin-right:5px; border-radius:4px; cursor:pointer;" onclick="verFoto('${e.foto}')">Ver Foto 📸</button>`;
        }

        tabela.innerHTML += `
            <tr>
                <td>${e.cliente}</td>
                <td>${e.endereco}</td>
                <td class="${classe}">${e.status}</td>
                <td>
                    ${acaoPrincipal}
                    <button style="background:#ef4444; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;" onclick="excluir(${e.id})">Excluir</button>
                </td>
            </tr>`;
    });
}

function verFoto(base64) {
    const win = window.open();
    win.document.write(`<body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center;"><img src="${base64}" style="max-width:100%; max-height:100vh;" /></body>`);
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
