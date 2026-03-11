// 1. DADOS E VARIÁVEIS GLOBAIS
let entregas = JSON.parse(localStorage.getItem('planfeto_db')) || [];
let entregaPendenteId = null; 
let map;

// 2. FUNÇÃO DE LOGIN
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

// 3. NAVEGAÇÃO ENTRE PÁGINAS
function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(s => s.classList.add('hidden'));
    
    document.getElementById(pageId).classList.remove('hidden');

    if (pageId === 'dashboard') atualizarDashboard();
    if (pageId === 'lista') renderizarTabela(); 
    
    if (pageId === 'mapa-rastreio') {
        setTimeout(() => {
            initMap();
            if(map) map.invalidateSize();
        }, 300);
    }
}

// 4. CADASTRO (Sem foto aqui, apenas dados)
function addEntrega() {
    const cliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const status = document.getElementById('status').value;

    if (!cliente || !endereco) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    const nova = { 
        id: Date.now(), 
        cliente, 
        endereco, 
        status, 
        foto: "" // Inicia vazio, será preenchido na entrega
    };

    entregas.push(nova);
    localStorage.setItem('planfeto_db', JSON.stringify(entregas));

    document.getElementById('cliente').value = "";
    document.getElementById('endereco').value = "";

    alert("Cadastrado com sucesso!");
    showPage('lista');
}

// 5. LÓGICA DO MODAL DE FOTO (FINALIZAR ENTREGA)
function marcarEntregue(id) {
    entregaPendenteId = id; 
    document.getElementById('modalFoto').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modalFoto').classList.add('hidden');
    document.getElementById('fotoEntrega').value = "";
    entregaPendenteId = null;
}

function simularEnvioFoto() {
    const btnEnvia = document.getElementById('btn-envia');
    const btnCancela = document.getElementById('btn-cancela');
    const barraArea = document.getElementById('progresso-area');
    const barra = document.getElementById('barra');

    // Desativa botões e mostra barra
    btnEnvia.disabled = true;
    btnEnvia.innerText = "Enviando...";
    barraArea.classList.remove('hidden');

    // Simula o carregamento da "foto"
    let progresso = 0;
    const intervalo = setInterval(() => {
        progresso += 20;
        barra.style.width = progresso + "%";

        if (progresso >= 100) {
            clearInterval(intervalo);
            finalizarSimulacao();
        }
    }, 400);
}

function finalizarSimulacao() {
    const index = entregas.findIndex(ent => ent.id === entregaPendenteId);
    if (index !== -1) {
        entregas[index].status = "Entregue";
        // Colocamos um ícone de foto fake só para preencher o campo
        entregas[index].foto = "fake-photo-placeholder"; 
        
        localStorage.setItem('planfeto_db', JSON.stringify(entregas));
        
        alert("Foto enviada com sucesso para o sistema Planfeto!");
        
        // Reseta o modal para o estado original e fecha
        document.getElementById('btn-envia').disabled = false;
        document.getElementById('btn-envia').innerText = "Simular Envio de Foto 📸";
        document.getElementById('progresso-area').classList.add('hidden');
        document.getElementById('barra').style.width = "0%";
        
        fecharModal();
        renderizarTabela();
        atualizarDashboard();
    }
}
// 6. RENDERIZAÇÃO E DASHBOARD
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

// 7. FUNÇÕES AUXILIARES (IMAGEM E MAPA)
function verFoto(foto) {
    if (foto === "fake-photo-placeholder") {
        alert("Senhor Marcelo, esta é uma visualização demonstrativa. No sistema real, a foto capturada pelo funcionário apareceria aqui para o cliente conferir.");
    } else {
        // Se for uma foto real (Base64), abre normal
        const win = window.open();
        win.document.write(`<img src="${foto}" style="width:100%">`);
    }
}

function redimensionarImagem(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Reduz para no máximo 800px de largura
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Salva em JPEG com 70% de qualidade
            };
        };
    });
}

function excluir(id) {
    if(confirm("Deseja excluir este registro?")) {
        entregas = entregas.filter(e => e.id !== id);
        localStorage.setItem('planfeto_db', JSON.stringify(entregas));
        renderizarTabela();
        atualizarDashboard();
    }
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
