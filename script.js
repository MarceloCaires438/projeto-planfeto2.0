let entregas = JSON.parse(localStorage.getItem("entregas")) || []

function login(){

let u = document.getElementById("user").value
let p = document.getElementById("pass").value

if(u === "admin" && p === "123"){

document.getElementById("login").style.display="none"
document.getElementById("app").classList.remove("hidden")

update()

}else{

alert("Login inválido")

}

}

function logout(){
location.reload()
}

function showPage(page){

document.querySelectorAll("main section")
.forEach(s => s.classList.add("hidden"))

document.getElementById(page).classList.remove("hidden")

if(page === "lista") render()

}

function addEntrega(){

let cliente = document.getElementById("cliente").value
let endereco = document.getElementById("endereco").value
let status = document.getElementById("status").value

entregas.push({cliente,endereco,status})

localStorage.setItem("entregas",JSON.stringify(entregas))

alert("Entrega cadastrada!")

update()

}

function render(){

let tabela = document.getElementById("tabela")

tabela.innerHTML=""

entregas.forEach((e,i)=>{

tabela.innerHTML += `
<tr>
<td>${e.cliente}</td>
<td>${e.endereco}</td>
<td>${e.status}</td>
<td>
<button onclick="toggle(${i})">Status</button>
</td>
</tr>
`

})

}

function toggle(i){

entregas[i].status =
entregas[i].status === "Pendente" ? "Entregue" : "Pendente"

localStorage.setItem("entregas",JSON.stringify(entregas))

render()
update()

}

function buscar(){

let termo = document.getElementById("busca").value.toLowerCase()

let linhas = document.querySelectorAll("#tabela tr")

linhas.forEach(l=>{

let cliente = l.children[0].innerText.toLowerCase()

l.style.display = cliente.includes(termo) ? "" : "none"

})

}

function update(){

let total = entregas.length
let pendentes = entregas.filter(e=>e.status==="Pendente").length
let entregues = entregas.filter(e=>e.status==="Entregue").length

document.getElementById("total").innerText = total
document.getElementById("pendentes").innerText = pendentes
document.getElementById("entregues").innerText = entregues

}
