// ================================
// SUPABASE CONFIG
// ================================
const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {

    // 🔐 Verificar sessão
const { data: { session } } = await db.auth.getSession();

if (!session) {
  window.location.href = "login.html";
  return;
}
  const totalBuscasEl = document.getElementById("totalBuscas");
  const listaEl = document.getElementById("relatorioLista");
  const btnDetalhes = document.getElementById("btnDetalhes");
  const detalhesContainer = document.getElementById("detalhesContainer");

  let carregado = false;
  let aberto = false;

  // 🔢 TOTAL GERAL
  const { count } = await db
    .from("search_logs")
    .select("*", { count: "exact", head: true });

  totalBuscasEl.textContent = count || 0;

  // 🔘 Toggle
  btnDetalhes.addEventListener("click", async () => {

    // Se ainda não carregou os dados, carrega uma vez
    if (!carregado) {
      const { data, error } = await db.rpc("buscas_agrupadas");

      if (error) {
        console.error(error);
        return;
      }

      data.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "resultado-card";
        linha.innerHTML = `
          <span class="resultado-cidade">${item.termo}</span>
          <span class="separador">|</span>
          <span class="resultado-codigo">${item.total_buscas}</span>
        `;
        listaEl.appendChild(linha);
      });

      carregado = true;
    }

    // Toggle real (sem depender de CSS)
    if (!aberto) {
      detalhesContainer.style.display = "block";
      btnDetalhes.textContent = "− Ocultar";
      aberto = true;
    } else {
      detalhesContainer.style.display = "none";
      btnDetalhes.textContent = "+ Detalhes";
      aberto = false;
    }

  });

  // 🔒 Começa oculto
  detalhesContainer.style.display = "none";

});