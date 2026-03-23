// ========================================
// SUPABASE
// ========================================
const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// ELEMENTOS
// ========================================

const btnAddMesa = document.getElementById("btnAddMesa");

const esquerda = document.getElementById("mesasEsquerda");
const direita = document.getElementById("mesasDireita");

const fanoutInput = document.getElementById("fanoutInput");
const listaFanouts = document.getElementById("listaFanouts");

let contadorMesa = 1;


// ========================================
// MOCK FAN-OUTS
// ========================================

const fanoutsMock = [
  "LMG-05",
  "LMG-07X",
  "LMG-09",
  "LMG-11",
  "LMG-11-X",
  "LMG-15",
  "LMG-49"
];

listaFanouts.innerHTML = "";

fanoutsMock.forEach(nome => {

  const div = document.createElement("div");
  div.className = "fanout-item"; // 🔥 IMPORTANTE
  div.innerText = nome;

  listaFanouts.appendChild(div);

});


// ========================================
// BUSCA FAN-OUT (FUNCIONANDO)
// ========================================

fanoutInput.addEventListener("input", () => {

  console.log("DIGITOU:", fanoutInput.value);

  const termo = fanoutInput.value.toLowerCase();
  const itens = listaFanouts.querySelectorAll(".fanout-item");

  itens.forEach(item => {

    const texto = item.innerText.toLowerCase();

    if (texto.includes(termo)) {
      item.style.display = "";
    } else {
      item.style.setProperty("display", "none", "important");
    }

  });

});


// ========================================
// CRIAR PAR DE MESAS (SIMETRIA)
// ========================================

btnAddMesa.onclick = () => {

  const numero = contadorMesa;

  const mesaE = criarMesa(numero, "E");
  const mesaD = criarMesa(numero, "D");

  esquerda.appendChild(mesaE);
  direita.appendChild(mesaD);

  contadorMesa++;

};


// ========================================
// FUNÇÃO CRIAR MESA
// ========================================

function criarMesa(numero, lado) {

  const div = document.createElement("div");
  div.className = "mesa";

  div.innerHTML = `
    <div class="numero-mesa"><strong>Mesa ${numero} ${lado}</strong></div>

    <div class="fanouts-mesa"></div>

    <div class="add-manual">+ manual</div>

    <div class="pb">P | B</div>
  `;

  return div;

}