// ================================
// SUPABASE CONFIG
// ================================
const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {

  const btnCriar = document.getElementById("btnCriarTO");
  const btnSalvar = document.getElementById("salvarTO");
  const modal = document.getElementById("modalCriarTO");
  const fecharModal = document.getElementById("fecharModal");
  const logoutBtn = document.getElementById("logoutBtn");

  const inputCidade = document.getElementById("novaCidade");
  const inputEstado = document.getElementById("novoEstado");
  const inputCodigo = document.getElementById("novoCodigo");
  const inputTipo = document.getElementById("novoTipo");

  const adminSearch = document.getElementById("adminSearch");
  const adminResults = document.getElementById("adminResults");

  let debounceTimeout;

  // 🔠 FORÇAR CAIXA ALTA
  [inputCidade, inputEstado, inputCodigo].forEach(input => {
    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase();
    });
  });

  // 🔐 Verificar sessão
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // ================================
  // 🔎 BUSCA ADMIN
  // ================================

  adminSearch.addEventListener("input", () => {

    adminSearch.value = adminSearch.value.toUpperCase();

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      buscar(adminSearch.value.trim());
    }, 300);

  });

  async function buscar(termo) {

    if (!termo) {
      adminResults.innerHTML = "";
      return;
    }

    const { data, error } = await db
      .from("tos")
      .select("*")
      .or(`and(codigo.ilike.%${termo}%,deleted_at.is.null),and(cidade.ilike.%${termo}%,deleted_at.is.null),and(estado.ilike.%${termo}%,deleted_at.is.null),and(tipo.ilike.%${termo}%,deleted_at.is.null)`)
      .order("cidade", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    renderizar(data);
  }

  function renderizar(lista) {

    adminResults.innerHTML = "";

    if (!lista || lista.length === 0) {
      adminResults.innerHTML = "<p>Nenhum resultado encontrado.</p>";
      return;
    }

    lista.forEach(item => {

      const linha = document.createElement("div");
      linha.className = "resultado-card";

      linha.innerHTML = `
  <span class="badge ${item.tipo}">${item.tipo}</span>

  <span class="resultado-cidade">${item.cidade}</span>

  <span class="separador">|</span>

  <span class="resultado-codigo">${item.codigo}</span>

  <button class="btn-edit"><i class="bi bi-pencil"></i></button>
  <button class="btn-delete"><i class="bi bi-trash"></i></button>
`;

      adminResults.appendChild(linha);

      // 🔥 DELETE
      const btnDelete = linha.querySelector(".btn-delete");

      btnDelete.addEventListener("click", async () => {

        const confirmar = confirm("Tem certeza que deseja excluir esta TO?");
        if (!confirmar) return;

        const { error } = await db
          .from("tos")
          .update({ deleted_at: new Date() })
          .eq("id", item.id);

        if (error) {
          alert("Erro ao excluir.");
          console.error(error);
          return;
        }

        linha.remove();

      });
      // ✏️ EDITAR
const btnEdit = linha.querySelector(".btn-edit");

btnEdit.addEventListener("click", async () => {

  const cidadeSpan = linha.querySelector(".resultado-cidade");
  const codigoSpan = linha.querySelector(".resultado-codigo");

  const editando = linha.classList.contains("editando");

  // 🔄 SE JÁ ESTIVER EDITANDO → SALVAR
  if (editando) {

    const novaCidade = linha.querySelector(".edit-cidade").value.toUpperCase();
    const novoCodigo = linha.querySelector(".edit-codigo").value.toUpperCase();

    const { error } = await db
      .from("tos")
      .update({
        cidade: novaCidade,
        codigo: novoCodigo
      })
      .eq("id", item.id);

    if (error) {
      alert("Erro ao atualizar.");
      console.error(error);
      return;
    }

    cidadeSpan.textContent = novaCidade;
    codigoSpan.textContent = novoCodigo;

    linha.classList.remove("editando");
    btnEdit.innerHTML = `<i class="bi bi-pencil"></i>`;

    return;
  }

  // ✏️ ENTRAR EM MODO EDIÇÃO
  linha.classList.add("editando");

  const cidadeAtual = cidadeSpan.textContent;
  const codigoAtual = codigoSpan.textContent;

  cidadeSpan.innerHTML = `
    <input type="text" class="edit-input edit-cidade" value="${cidadeAtual}">
  `;

  codigoSpan.innerHTML = `
    <input type="text" class="edit-input edit-codigo" value="${codigoAtual}">
  `;

  btnEdit.innerHTML = `<i class="bi bi-check-lg"></i>`;

});

    });

  }

  // 🚪 Logout
  // 🔁 Voltar para busca encerrando sessão
  const voltarBusca = document.getElementById("voltarBusca");

  voltarBusca.addEventListener("click", async () => {
    await db.auth.signOut();
    window.location.href = "index.html";
  });
  logoutBtn.addEventListener("click", async () => {
    await db.auth.signOut();
    window.location.href = "index.html";
  });

  // 🟠 Abrir modal
  btnCriar.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // ❌ Fechar no X
  fecharModal.addEventListener("click", () => {
    fechar();
  });

  // ❌ Fechar clicando fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fechar();
    }
  });

  function fechar() {
    modal.classList.add("hidden");
    inputCidade.value = "";
    inputEstado.value = "";
    inputCodigo.value = "";
  }

  // ================================
  // 💾 SALVAR TO
  // ================================
  btnSalvar.addEventListener("click", async () => {

    const tipo = inputTipo.value;
    const cidade = inputCidade.value.trim();
    const estado = inputEstado.value.trim();
    const codigo = inputCodigo.value.trim();

    if (!cidade || !estado || !codigo) {
      alert("Preencha todos os campos.");
      return;
    }

    const { data: existente } = await db
      .from("tos")
      .select("id")
      .eq("codigo", codigo)
      .maybeSingle();

    if (existente) {
      alert("Já existe uma TO com esse código.");
      return;
    }

    const { error } = await db
      .from("tos")
      .insert([{ tipo, cidade, estado, codigo }]);

    if (error) {
      console.error(error);
      alert("Erro ao salvar.");
      return;
    }

    alert("TO criada com sucesso!");
    fechar();
  });

});