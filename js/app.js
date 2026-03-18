
// SUPABASE
// ========================================

const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ELEMENTOS
const btnAddMesa = document.getElementById("btnAddMesa");
const mesasEsquerda = document.getElementById("mesasEsquerda");
const mesasDireita = document.getElementById("mesasDireita");

const fanoutInput = document.getElementById("fanoutInput");
const listaFanouts = document.getElementById("listaFanouts");

let contadorMesa = 1;
let fanoutSelecionado = null;
let todosFanouts = [];

// CRIAR MESA
function criarMesa(numero,lado){

const mesa = document.createElement("div");
mesa.className = "mesa";

mesa.innerHTML = `
<div class="numero-mesa">Mesa ${numero} ${lado === "E" ? "Esquerda" : "Direita"}</div>
<div class="fanouts-mesa"></div>
<div class="posicoes">
P: ___ | B: ___
</div>
`;

const fanoutContainer = mesa.querySelector(".fanouts-mesa");

mesa.onclick = ()=>{

if(!fanoutSelecionado) return;

// cria fanout na mesa
const f = document.createElement("div");
f.innerText = fanoutSelecionado;
fanoutContainer.appendChild(f);

// atualiza badge
const itens = document.querySelectorAll(".fanout-item");

itens.forEach(item=>{
const nome = item.querySelector("span").innerText;

if(nome === fanoutSelecionado){

const badge = item.querySelector(".badge");
badge.innerText = parseInt(badge.innerText) + 1;
const total = parseInt(badge.innerText);

badge.className = "badge";

if(total === 0){
  badge.classList.add("bg-danger");
}
else if(total === 1){
  badge.classList.add("bg-warning","text-dark");
}
else if(total === 2){
  badge.classList.add("bg-primary");
}
else{
  badge.classList.add("bg-success");
}
}

});

};

return mesa;
}

// BOTÃO
btnAddMesa.onclick = ()=>{

const numero = contadorMesa;

mesasEsquerda.appendChild(criarMesa(numero,"E"));
mesasDireita.appendChild(criarMesa(numero,"D"));

contadorMesa++;

};

// FANOUT LISTA
function criarFanoutLista(valor){

const div = document.createElement("div");

div.className = "fanout-item d-flex justify-content-between align-items-center";

div.innerHTML = `
<span>${valor}</span>
<span class="badge bg-secondary">0</span>
`;

div.onclick = ()=>{

document.querySelectorAll(".fanout-item")
.forEach(el=>el.classList.remove("selecionado"));

div.classList.add("selecionado");

fanoutSelecionado = valor;

};

listaFanouts.appendChild(div);
}

// CARREGAR FANOUTS
async function carregarFanouts(){

const { data } = await db
.from("tos")
.select("codigo")
.order("codigo");

if(!data) return;

todosFanouts = data.map(f=>f.codigo);

}

// BUSCA
fanoutInput.addEventListener("input",()=>{

const termo = fanoutInput.value.toLowerCase();

listaFanouts.innerHTML = "";

if(termo.length === 0) return;

const filtrados = todosFanouts.filter(f=>
f.toLowerCase().includes(termo)
);

filtrados.forEach(f=>{
criarFanoutLista(f);
});

});

// INIT
window.onload = ()=>{

carregarFanouts();

};