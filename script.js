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
// 1. Abre a janela de simulação
function marcarEntregue(id) {
    entregaPendenteId = id; 
    const modal = document.getElementById('modalFoto');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Garante que ele apareça centralizado
    }
}

// 2. Fecha a janela e limpa os efeitos
function fecharModal() {
    const modal = document.getElementById('modalFoto');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none'; // Esconde completamente o fundo escuro
    }
    
    // Reseta a barra para a próxima vez
    const barra = document.getElementById('barra');
    if (barra) barra.style.width = "0%";
    
    const barraArea = document.getElementById('progresso-area');
    if (barraArea) barraArea.classList.add('hidden');

    const btnEnvia = document.getElementById('btn-envia');
    if (btnEnvia) {
        btnEnvia.disabled = false;
        btnEnvia.innerText = "Simular Envio de Foto 📸";
    }
    
    entregaPendenteId = null;
}

// 3. A lógica do botão de simulação
function simularEnvioFoto() {
    const btnEnvia = document.getElementById('btn-envia');
    const barraArea = document.getElementById('progresso-area');
    const barra = document.getElementById('barra');

    btnEnvia.disabled = true;
    btnEnvia.innerText = "Enviando...";
    barraArea.classList.remove('hidden');

    let progresso = 0;
    const intervalo = setInterval(() => {
        progresso += 25; // Sobe de 25 em 25%
        barra.style.width = progresso + "%";

        if (progresso >= 100) {
            clearInterval(intervalo);
            
            // ESSA PARTE RESOLVE O SEU PROBLEMA:
            const index = entregas.findIndex(ent => ent.id === entregaPendenteId);
            if (index !== -1) {
                entregas[index].status = "Entregue";
                entregas[index].foto = "fake-photo-placeholder"; 
                
                localStorage.setItem('planfeto_db', JSON.stringify(entregas));
                
                alert("Foto enviada com sucesso para o sistema Planfeto!");
                
                fecharModal(); // Fecha a janela preta
                renderizarTabela(); // Atualiza a tabela para aparecer "Entregue"
                atualizarDashboard(); // Atualiza os números do painel
            }
        }
    }, 400); // Velocidade do carregamento
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

        // Dentro do entregas.forEach no script.js, mude para:
        tabela.innerHTML += `
            <tr>
                <td data-label="Cliente">${e.cliente}</td>
                <td data-label="Endereço">${e.endereco}</td>
                <td data-label="Status" class="${classe}">${e.status}</td>
                <td data-label="Ação">
                    ${acaoPrincipal}
                    <button style="background:#ef4444; color:white; border:none; padding:8px; border-radius:4px;" onclick="excluir(${e.id})">X</button>
                </td>
            </tr>`;
    });
}

// 7. FUNÇÕES AUXILIARES (IMAGEM E MAPA)
function verFoto(foto) {
    if (foto === "fake-photo-placeholder") {
        alert("Esta é uma visualização demonstrativa. No sistema real, a foto capturada pelo funcionário aparecerá aqui para o cliente conferir.");
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
