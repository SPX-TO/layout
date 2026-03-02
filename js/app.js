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

// Mostrar sempre (para testar)
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

  // 🔠 FORÇAR CAIXA ALTA
  searchInput.addEventListener("input", () => {
    searchInput.value = searchInput.value.toUpperCase();

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      buscar(searchInput.value.trim());
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

    if (!termo) {
      resultsContainer.innerHTML = "";
      return;
    }
// 🔎 Registrar busca
await db.from("search_logs").insert([{ termo }]);
    const { data, error } = await db
      .from("tos")
.select("*")
.or(`
  and(codigo.ilike.%${termo}%,deleted_at.is.null),
  and(cidade.ilike.%${termo}%,deleted_at.is.null),
  and(estado.ilike.%${termo}%,deleted_at.is.null),
  and(tipo.ilike.%${termo}%,deleted_at.is.null)
`)
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

    resultsContainer.innerHTML = "";
    resultadoCard.style.display = "none";

    if (!lista || lista.length === 0) {
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
  // 📋 COPIAR CÓDIGO
  // ================================
  function ativarCopiar() {
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const texto = btn.getAttribute("data-copy");
        navigator.clipboard.writeText(texto);
      });
    });
  }

});