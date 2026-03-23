// ===============================
// CONFIG SUPABASE
// ===============================
const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================================================
// ELEMENTOS
// ==================================================
const btnAddMesa = document.getElementById("btnAddMesa");

const mesasEsquerda = document.getElementById("mesasEsquerda");
const mesasDireita = document.getElementById("mesasDireita");

const fanoutInput = document.getElementById("fanoutInput");
const listaBusca = document.getElementById("listaFanoutsBusca");
const listaSelecionados = document.getElementById("listaFanoutsSelecionados");

const buscaOperador = document.getElementById("buscaOperador");
const listaOperadoresBusca = document.getElementById("listaOperadoresBusca");

const blocoFanout = document.getElementById("blocoFanout");
const blocoOperadores = document.getElementById("blocoOperadores");

// ==================================================
// ESTADO
// ==================================================
let contadorMesa = 1;
let todosFanouts = [];
let todosOperadores = [];

// ==================================================
// FORMATAR NOME
// ==================================================
function formatarNome(nome){

const ignorar = ["de","da","do","das","dos"];
const partes = nome.trim().toLowerCase().split(" ");

const primeiro = partes[0].charAt(0).toUpperCase() + partes[0].slice(1);

let ultimo = "";
for(let i = partes.length - 1; i > 0; i--){
if(!ignorar.includes(partes[i])){
ultimo = partes[i];
break;
}
}

if(!ultimo) return primeiro;

return `${primeiro} ${ultimo.charAt(0).toUpperCase()}.`;

}

// ==================================================
// FANOUT - BUSCA
// ==================================================
fanoutInput.addEventListener("input",()=>{

const termo = fanoutInput.value.toUpperCase();
listaBusca.innerHTML = "";

if(termo.length < 2) return;

const filtrados = todosFanouts.filter(f => f.includes(termo));

filtrados.slice(0,100).forEach(f=>{

const div = document.createElement("div");
div.className = "fanout-btn";
div.setAttribute("draggable", true);

div.innerHTML = `
<span>${f}</span>
<span class="badge-fanout">0</span>
`;

div.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("fanout", f);
});

div.onclick = ()=>{
listaSelecionados.appendChild(div);
};

listaBusca.appendChild(div);

});

});

// ==================================================
// OPERADORES
// ==================================================
function renderOperadores(lista){

listaOperadoresBusca.innerHTML = "";

lista.forEach(op=>{

const nomeCompleto = op.nome + " " + op.sobrenome;
const curto = formatarNome(nomeCompleto);

const div = document.createElement("div");
div.className = "operador-item";
div.innerText = curto;

// click → indução
div.onclick = ()=>{

document.querySelectorAll(".operador-tag").forEach(el=>{
if(el.innerText === curto){
el.remove();
}
});

const inducao = document.querySelector('[data-funcao="inducao"]');

const tag = criarTagOperador(nomeCompleto, curto);
inducao.appendChild(tag);

};

div.setAttribute("draggable", true);

div.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("operador", nomeCompleto);
});

listaOperadoresBusca.appendChild(div);

});

}

// ==================================================
// TAG OPERADOR
// ==================================================
function criarTagOperador(nomeCompleto, curto){

const tag = document.createElement("div");
tag.className = "operador-tag";
tag.innerText = curto;

tag.setAttribute("draggable", true);

tag.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("operador", nomeCompleto);
});

tag.addEventListener("contextmenu",(e)=>{
e.preventDefault();
tag.remove();
});

return tag;

}

// ==================================================
// BUSCA OPERADOR
// ==================================================
buscaOperador.addEventListener("input",()=>{

const termo = buscaOperador.value.toLowerCase();

if(termo.length < 1){
renderOperadores(todosOperadores);
return;
}

const filtrados = todosOperadores.filter(op =>
(op.nome + " " + op.sobrenome).toLowerCase().includes(termo)
);

renderOperadores(filtrados);

});

// ==================================================
// DRAG ENTRE FUNÇÕES
// ==================================================
document.querySelectorAll(".drop-funcao").forEach(area=>{

area.addEventListener("dragover",(e)=> e.preventDefault());

area.addEventListener("drop",(e)=>{

e.preventDefault();

const nome = e.dataTransfer.getData("operador");
if(!nome) return;

const curto = formatarNome(nome);

// remove de todas
document.querySelectorAll(".operador-tag").forEach(el=>{
if(el.innerText === curto){
el.remove();
}
});

const tag = criarTagOperador(nome, curto);
area.appendChild(tag);

});

});

// ==================================================
// POSICIONAMENTO OPERADORES (VERSÃO QUE FUNCIONAVA)
// ==================================================

// clicar no título do fanout também fecha operadores
blocoFanout.querySelector(".box-title").addEventListener("click",()=>{

blocoOperadores.classList.remove("ativo");
blocoOperadores.style.marginTop = "0px";

});
function ajustarPosicaoOperadores(){

const altura = blocoFanout.offsetHeight;
blocoOperadores.style.marginTop = `-${altura - 60}px`;

}

// foco operador
buscaOperador.addEventListener("focus",()=>{
blocoOperadores.classList.add("ativo");
setTimeout(ajustarPosicaoOperadores,50);
});

// voltar fanout
fanoutInput.addEventListener("focus",()=>{
blocoOperadores.classList.remove("ativo");
blocoOperadores.style.marginTop = "0px";
});

// ==================================================
// DADOS
// ==================================================
async function carregarFanouts(){

const { data } = await db
.from("tos")
.select("codigo")
.order("codigo");

todosFanouts = data.map(f=>f.codigo);

}



async function carregarOperadores(){

const { data } = await db
.from("operadores")
.select("nome, sobrenome");

todosOperadores = data || [];

// 🔥 render inicial
renderOperadores(todosOperadores);

}

// ==================================================
// INIT
// ==================================================
window.onload = ()=>{

carregarFanouts();
carregarOperadores();

btnAddMesa.click();

};




function criarMesa(numero, lado){

const mesa = document.createElement("div");
mesa.className = "mesa";

mesa.innerHTML = `
<div class="numero-mesa">Mesa ${numero}</div>
<div class="fanouts-mesa"></div>
`;

return mesa;

}

btnAddMesa.onclick = ()=>{

mesasEsquerda.appendChild(criarMesa(contadorMesa,"E"));
mesasDireita.appendChild(criarMesa(contadorMesa,"D"));

contadorMesa++;

};