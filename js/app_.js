// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// ESTADO
// ========================================

let contadorMesa = 1;
let fanoutsSelecionados = {};
let todosFanouts = [];

// ========================================
// ELEMENTOS
// ========================================

const btnAddMesa = document.getElementById("btnAddMesa");
const esquerda = document.getElementById("mesasEsquerda");
const direita = document.getElementById("mesasDireita");

const fanoutInput = document.getElementById("fanoutInput");
const listaFanouts = document.getElementById("listaFanouts");
const listaSelecionados = document.getElementById("fanoutsSelecionados");

// ========================================
// MOCK FANOUTS (SEM SUPABASE PRA NÃO QUEBRAR)
// ========================================

function carregarFanouts(){
  todosFanouts = [
    "LMG-05","LMG-07X","LMG-09","LMG-11","LMG-11-X",
    "LMG-110","LMG-111","LMG-112","LMG-113","LMG-116",
    "LMG-118","LMG-14","LMG-15","LMG-20","LMG-21",
    "LMG-23","LMG-27","LMG-36","LMG-38","LMG-39"
  ];
}

// ========================================
// CRIAR MESA
// ========================================

function criarMesa(numero, lado){

  const mesa = document.createElement("div");
  mesa.className = "mesa";

  mesa.innerHTML = `
    <div class="numero-mesa">Mesa ${numero} ${lado}</div>
    <div class="fanouts-mesa"></div>
    <div class="posicoes">
      <div>P:</div>
      <div>B:</div>
    </div>
  `;

  const container = mesa.querySelector(".fanouts-mesa");

  container.addEventListener("dragover", e => e.preventDefault());

  container.addEventListener("drop", (e)=>{
    e.preventDefault();

    const valor = e.dataTransfer.getData("text/plain");
    if(!valor) return;

    // evitar duplicado
    const existe = [...container.children]
      .some(el => el.innerText === valor);

    if(existe){
      container.classList.add("erro");
      setTimeout(()=>container.classList.remove("erro"),500);
      return;
    }

    const item = document.createElement("div");
    item.className = "fanout-mesa";
    item.innerText = valor;

    // remover com botão direito
    item.addEventListener("contextmenu",(e)=>{
      e.preventDefault();
      item.remove();

      fanoutsSelecionados[valor]--;
      if(fanoutsSelecionados[valor] <= 0){
        delete fanoutsSelecionados[valor];
      }

      atualizarSelecionados();
    });

    container.appendChild(item);

    if(!fanoutsSelecionados[valor]){
      fanoutsSelecionados[valor] = 0;
    }

    fanoutsSelecionados[valor]++;
    atualizarSelecionados();

    container.classList.add("ok");
    setTimeout(()=>container.classList.remove("ok"),300);
  });

  return mesa;
}

// ========================================
// ADICIONAR MESA
// ========================================

btnAddMesa.onclick = ()=>{

  const mesaE = criarMesa(contadorMesa,"Esquerda");
  const mesaD = criarMesa(contadorMesa,"Direita");

  esquerda.appendChild(mesaE);
  direita.appendChild(mesaD);

  contadorMesa++;
};

// ========================================
// LISTA BUSCA
// ========================================

fanoutInput.addEventListener("input", ()=>{

  const termo = fanoutInput.value.toLowerCase();

  const filtrados = todosFanouts.filter(f =>
    f.toLowerCase().includes(termo) &&
    !fanoutsSelecionados[f]
  );

  listaFanouts.innerHTML = "";

  filtrados.forEach(f=>{

    const div = document.createElement("div");
    div.className = "fanout-item";
    div.innerText = f;
    div.draggable = true;

    div.addEventListener("dragstart",(e)=>{
      e.dataTransfer.setData("text/plain", f);

      if(!fanoutsSelecionados[f]){
        fanoutsSelecionados[f] = 0;
      }

      atualizarSelecionados();

      setTimeout(()=>div.remove(),0);
    });

    listaFanouts.appendChild(div);
  });

});

// ========================================
// LISTA SELECIONADOS
// ========================================

function atualizarSelecionados(){

  listaSelecionados.innerHTML = "";

  Object.entries(fanoutsSelecionados).forEach(([f,q])=>{

    let cor = "badge-vermelho";
    if(q === 1) cor = "badge-amarelo";
    if(q === 2) cor = "badge-azul";
    if(q >= 3) cor = "badge-verde";

    const div = document.createElement("div");
    div.className = "fanout-item";
    div.innerHTML = `${f} <span class="badge ${cor}">${q}</span>`;
    div.draggable = true;

    div.addEventListener("dragstart",(e)=>{
      e.dataTransfer.setData("text/plain", f);
    });

    listaSelecionados.appendChild(div);
  });
}

// ========================================
// INIT
// ========================================

window.onload = ()=>{
  carregarFanouts();
  btnAddMesa.click();
};