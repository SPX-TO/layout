

// ===============================
const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
const btnAddMesa = document.getElementById("btnAddMesa");
const containerMesas = document.getElementById("containerMesas");

const fanoutInput = document.getElementById("fanoutInput");
const listaBusca = document.getElementById("listaFanoutsBusca");
const listaSelecionados = document.getElementById("listaFanoutsSelecionados");

const buscaOperador = document.getElementById("buscaOperador");
const listaOperadoresBusca = document.getElementById("listaOperadoresBusca");

// ===============================
let contadorMesa = 1;
let todosFanouts = [];
let todosOperadores = [];
let contagemFanout = {};

// ===============================
function normalizarFanout(codigo){
return codigo.replace("XPT-","");
}

function formatarNome(nome){
const partes = nome.split(" ");
return partes[0] + " " + partes[partes.length-1][0] + ".";
}

// ===============================
// BADGE
// ===============================
function atualizarBadge(codigo){

let valor = Number(contagemFanout[codigo] || 0);

document.querySelectorAll(".fanout-btn").forEach(btn=>{

const span = btn.querySelector("span");
if(!span) return;

if(span.innerText.trim() === codigo){

const badge = btn.querySelector(".badge-fanout");
if(!badge) return;

badge.innerText = valor;

// força cor
if(valor === 0) badge.style.cssText = "background:#6c757d;color:#fff;";
else if(valor === 1) badge.style.cssText = "background:#dc3545;color:#fff;";
else if(valor === 2) badge.style.cssText = "background:#0d6efd;color:#fff;";
else if(valor === 3) badge.style.cssText = "background:#198754;color:#fff;";
else badge.style.cssText = "background:#6f42c1;color:#fff;";

}

});

}

// ===============================
// REMOVER DA BUSCA
// ===============================
function removerDaBusca(codigo){

document.querySelectorAll("#listaFanoutsBusca .fanout-btn").forEach(btn=>{

const span = btn.querySelector("span");
if(!span) return;

if(span.innerText === codigo){
btn.remove();
}

});

}

// ===============================
// SELECIONADOS
// ===============================
function adicionarSelecionado(codigo){

const existe = Array.from(listaSelecionados.children)
.some(el => el.querySelector("span")?.innerText === codigo);

if(existe) return;

const div = document.createElement("div");
div.className = "fanout-btn";
div.setAttribute("draggable", true);

div.innerHTML = `
<span>${codigo}</span>
<span class="badge-fanout">${contagemFanout[codigo] || 0}</span>
`;

div.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("fanout", codigo);
e.dataTransfer.effectAllowed = "move";
});

listaSelecionados.appendChild(div);
atualizarBadge(codigo);
}

// ===============================
// BUSCA
// ===============================
fanoutInput.addEventListener("input",()=>{

const termo = fanoutInput.value.toUpperCase();
listaBusca.innerHTML = "";

if(termo.length < 2) return;

const filtrados = todosFanouts.filter(f => f.includes(termo));

filtrados.forEach(f=>{

const codigo = normalizarFanout(f);

const div = document.createElement("div");
div.className = "fanout-btn";
div.setAttribute("draggable", true);

div.innerHTML = `
<span>${codigo}</span>
<span class="badge-fanout">${contagemFanout[codigo] || 0}</span>
`;

div.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("fanout", codigo);
e.dataTransfer.effectAllowed = "move";
});

div.onclick = ()=>{
adicionarSelecionado(codigo);
removerDaBusca(codigo);
};

listaBusca.appendChild(div);
atualizarBadge(codigo);

});

});

// ===============================
// OPERADORES
// ===============================
function renderOperadores(lista){

listaOperadoresBusca.innerHTML = "";

lista.forEach(op=>{

const nome = op.nome + " " + op.sobrenome;
const curto = formatarNome(nome);

const div = document.createElement("div");
div.className = "operador-item";
div.innerText = curto;

div.setAttribute("draggable", true);

div.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("operador", nome);
});

listaOperadoresBusca.appendChild(div);

});
}

buscaOperador.addEventListener("input",()=>{

const termo = buscaOperador.value.toLowerCase();

const filtrados = todosOperadores.filter(op =>
(op.nome + " " + op.sobrenome).toLowerCase().includes(termo)
);

renderOperadores(filtrados);

});

// ===============================
// MESA
// ===============================
function criarLinhaMesa(numero){

const linha = document.createElement("div");
linha.className = "linha-mesa";

linha.innerHTML = `
<div class="mesa">
<div class="numero-mesa">Mesa ${numero} E</div>
<div class="fanouts-mesa"></div>

<div class="posicoes">
<div class="funcao drop-pesca">Pesca:</div>
<div class="funcao drop-bipe">Bipe:</div>
</div>
</div>

<div class="esteira-mini">↓</div>

<div class="mesa">
<div class="numero-mesa">Mesa ${numero} D</div>
<div class="fanouts-mesa"></div>

<div class="posicoes">
<div class="funcao drop-pesca">Pesca:</div>
<div class="funcao drop-bipe">Bipe:</div>
</div>
</div>
`;

linha.querySelectorAll(".mesa").forEach(mesa=>{

const container = mesa.querySelector(".fanouts-mesa");

mesa.addEventListener("dragover",(e)=> e.preventDefault());

mesa.addEventListener("drop",(e)=>{

e.preventDefault();

const valor = e.dataTransfer.getData("fanout");
if(!valor) return;

const jaExiste = Array.from(container.children)
.some(el => el.innerText === valor);

if(jaExiste) return;

const item = document.createElement("div");
item.innerText = valor;
item.setAttribute("draggable", true);

item.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("fanout", valor);
e.dataTransfer.effectAllowed = "move";
});

// badge
contagemFanout[valor] = (contagemFanout[valor] || 0) + 1;
atualizarBadge(valor);

// selecionados + remove busca
adicionarSelecionado(valor);
removerDaBusca(valor);

container.appendChild(item);

});

});

// OPERADOR
linha.querySelectorAll(".drop-pesca, .drop-bipe").forEach(area=>{

area.addEventListener("dragover",(e)=> e.preventDefault());

area.addEventListener("drop",(e)=>{

e.preventDefault();

const nome = e.dataTransfer.getData("operador");
if(!nome) return;

const curto = formatarNome(nome);

area.innerHTML = area.classList.contains("drop-pesca") ? "Pesca: " : "Bipe: ";

const tag = document.createElement("span");
tag.className = "operador-tag";
tag.innerText = curto;

area.appendChild(tag);

});

});

return linha;

}

// ===============================
btnAddMesa.onclick = ()=>{
containerMesas.appendChild(criarLinhaMesa(contadorMesa));
contadorMesa++;
};

// ===============================
async function carregarFanouts(){

const { data } = await db
.from("tos")
.select("codigo")
.order("codigo");

todosFanouts = data.map(f=>f.codigo);

}

async function carregarOperadores(){

todosOperadores = [
{ nome: "Luciano", sobrenome: "Bento" },
{ nome: "Maria", sobrenome: "Silva" },
{ nome: "João", sobrenome: "Souza" },
{ nome: "Carlos", sobrenome: "Oliveira" }
];

renderOperadores(todosOperadores);

}

// ===============================
window.onload = ()=>{
carregarFanouts();
carregarOperadores();
btnAddMesa.click();
};

// ===============================
// HIGHLIGHT
// ===============================
document.addEventListener("mouseover",(e)=>{

const alvo = e.target.closest(".fanout-btn, .fanouts-mesa div");
if(!alvo) return;

const codigo = alvo.innerText.trim();

document.querySelectorAll(".mesa-highlight")
.forEach(el=> el.classList.remove("mesa-highlight"));

document.querySelectorAll(".mesa").forEach(mesa=>{

const tem = Array.from(
mesa.querySelectorAll(".fanouts-mesa div")
).some(el => el.innerText.trim() === codigo);

if(tem){
mesa.classList.add("mesa-highlight");
}

});

});

document.addEventListener("mouseout",()=>{
document.querySelectorAll(".mesa-highlight")
.forEach(el=> el.classList.remove("mesa-highlight"));
});