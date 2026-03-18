// ================================
// SUPABASE CONFIG
// ================================
const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================================
// INIT
// ================================
document.addEventListener("DOMContentLoaded", async () => {

const banner = document.getElementById("updateBanner");
const closeBanner = document.getElementById("closeBanner");

banner.style.display = "block";
document.body.classList.add("banner-active");

closeBanner.addEventListener("click", () => {
  banner.style.display = "none";
  document.body.classList.remove("banner-active");
});

const resultadoCard = document.getElementById("resultadoCard");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("results");

let debounceTimeout;
let ultimaBusca = "";

// 🔠 FORÇAR CAIXA ALTA
searchInput.addEventListener("input", () => {
  resultsContainer.innerHTML = "";
resultadoCard.style.display = "none";

searchInput.value = searchInput.value.toUpperCase();

clearTimeout(debounceTimeout);

debounceTimeout = setTimeout(() => {

const termo = searchInput.value.trim();

if (termo.length < 2) return;

buscar(termo);

}, 300);

});

if (!localStorage.getItem("favoritoAtualizado")) {
alert("ATENÇÃO: Atualize seu favorito para esta nova versão.");
localStorage.setItem("favoritoAtualizado", "true");
}

// ================================
// 🔎 FUNÇÃO DE BUSCA
// ================================
async function buscar(termo) {

termo = termo.trim();
termo = termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
termo = termo.replace(/^([A-Z]+)[\s\-]?(\d+)$/, "$1-$2");
const termoSemHifen = termo.replace("-", "");
if (termo === ultimaBusca) return;
ultimaBusca = termo;

if (searchInput.value.trim() !== termo) return;
if (!termo || termo.length < 2) {

resultsContainer.innerHTML = "";
resultadoCard.style.display = "none";

const contador = document.getElementById("contadorResultados");
if (contador) contador.innerText = "";

return;
}

// registrar busca
// await db.from("search_logs").insert([{ termo }]);
resultsContainer.innerHTML = "<div class='buscando'>Buscando...</div>";
resultadoCard.style.display = "block";

const { data, error } = await db
.from("tos")
.select("*")
.or(`codigo.ilike.%${termo}%,codigo.ilike.%${termoSemHifen}%,cidade.ilike.%${termo}%,estado.ilike.%${termo}%,tipo.ilike.%${termo}%`)
.is("deleted_at", null)
.order("cidade", { ascending: true });

if (error) {
console.error("Erro na busca:", error);
return;
}

renderizarResultados(data);

}

// ================================
// 🎨 RENDER RESULTADOS
// ================================
function renderizarResultados(lista) {
const contador = document.getElementById("contadorResultados");
if (contador) {
contador.innerText = lista ? lista.length + " resultados" : "0 resultados";
}
resultsContainer.innerHTML = "";
resultadoCard.style.display = "none";

if (!lista || lista.length === 0) {
resultsContainer.innerHTML = "<div class='nenhum-resultado'>Nenhum resultado encontrado</div>";
return;
}

resultadoCard.style.display = "block";

lista.forEach(to => {

const card = document.createElement("div");
card.classList.add("resultado-card");

card.innerHTML = `
<span class="badge ${to.tipo}">${to.tipo}</span>

<span class="resultado-cidade">${to.cidade}</span>

<button class="copy-btn" data-copy="${to.cidade}">
<i class="bi bi-clipboard"></i>
</button>

<span class="separador">|</span>

<span class="resultado-codigo">${to.codigo}</span>

<button class="copy-btn" data-copy="${to.codigo}">
<i class="bi bi-clipboard"></i>
</button>
`;

resultsContainer.appendChild(card);

});

ativarCopiar();

}

// ================================
// 📋 COPIAR
// ================================
function ativarCopiar() {

document.querySelectorAll(".copy-btn").forEach(btn => {

btn.addEventListener("click", () => {

const texto = btn.getAttribute("data-copy");
navigator.clipboard.writeText(texto);

});

});

}

// ================================
// 💬 MODAL FEEDBACK
// ================================

const abrirFeedback = document.getElementById("abrirFeedback");
const modalFeedback = document.getElementById("modalFeedback");
const fecharFeedback = document.getElementById("fecharFeedback");
const enviarFeedback = document.getElementById("enviarFeedback");

const fbNome = document.getElementById("fbNome");
const fbWhatsapp = document.getElementById("fbWhatsapp");
const fbEmail = document.getElementById("fbEmail");
const fbMensagem = document.getElementById("fbMensagem");
const fbObrigado = document.getElementById("fbObrigado");

// abrir
abrirFeedback.onclick = () => {
modalFeedback.style.display = "flex";
};

// fechar
fecharFeedback.onclick = () => {
modalFeedback.style.display = "none";
};

// enviar
enviarFeedback.onclick = async () => {

if (!fbMensagem.value.trim()) {
alert("Digite uma mensagem.");
return;
}

await db.from("feedback_busca").insert([{
nome: fbNome.value,
whatsapp: fbWhatsapp.value,
email: fbEmail.value,
mensagem: fbMensagem.value
}]);

fbObrigado.style.display = "block";

// limpar campos
fbNome.value = "";
fbWhatsapp.value = "";
fbEmail.value = "";
fbMensagem.value = "";

// fechar após 2 segundos
setTimeout(() => {
modalFeedback.style.display = "none";
fbObrigado.style.display = "none";
}, 2000);

};

});