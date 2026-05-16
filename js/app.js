

// ===============================
const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
let contadorMesa = 1;
let todosFanouts = [];
let todosOperadores = [];
let contagemFanout = {};
const STORAGE_KEY = "layout_esteira_autosave";
// ===============================
const btnAddMesa = document.getElementById("btnAddMesa");
const containerMesas = document.getElementById("containerMesas");

const fanoutInput = document.getElementById("fanoutInput");
const listaFanoutsBusca = document.getElementById("listaFanoutsBusca");
const listaFanoutsSelecionados = document.getElementById("listaFanoutsSelecionados");

const buscaOperador = document.getElementById("buscaOperador");
const btnSalvarLayout = document.getElementById("btnSalvarLayout");
const btnCarregarLayout = document.getElementById("btnCarregarLayout");
const btnNovoLayout = document.getElementById("btnNovoLayout");

// ===============================
function formatarNome(nome) {
  const partes = nome.trim().split(" ");
  if (partes.length === 1) return partes[0];
  return partes[0] + " " + partes[partes.length - 1][0] + ".";
}

// ===============================
// FANOUT
// ===============================
function criarFanoutTag(codigo) {

  const div = document.createElement("div");
  div.className = "fanout-tag";

  const span = document.createElement("span");
  span.className = "fanout-codigo";
  span.innerText = codigo;

  const badge = document.createElement("span");
  badge.className = "badge-fanout badge-0";
  badge.innerText = "0";

  div.appendChild(span);
  div.appendChild(badge);

  div.setAttribute("draggable", true);

  div.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("fanout", codigo);
  });
  div.addEventListener("mouseenter", () => {

    document.querySelectorAll(".mesa").forEach(mesa => {

      const existe = Array.from(
        mesa.querySelectorAll(".fanout-tag span")
      ).some(span => span.innerText === codigo);

      if (existe) {
        mesa.classList.add("highlight-mesa");
      }

    });

  });

  div.addEventListener("mouseleave", () => {

    document.querySelectorAll(".mesa")
      .forEach(m => m.classList.remove("highlight-mesa"));

  });

  return div;
}

function adicionarSelecionado(codigo) {

  const existe = Array.from(listaFanoutsSelecionados.children)
    .some(el =>
      el.querySelector(".fanout-codigo")?.innerText === codigo
    );

  if (existe) return;

  const tag = criarFanoutTag(codigo);
  listaFanoutsSelecionados.appendChild(tag);
}

function atualizarBadge() {

  document.querySelectorAll(".fanout-tag").forEach(tag => {

    const codigo = tag.querySelector(".fanout-codigo")?.innerText;
    if (!codigo) return;

    const count = contagemFanout[codigo] || 0;
    const badge = tag.querySelector(".badge-fanout");
    if (!badge) return;
    badge.innerText = count;

    badge.classList.remove("badge-0", "badge-1", "badge-2", "badge-3", "badge-4");

    if (count === 0) badge.classList.add("badge-0");
    else if (count === 1) badge.classList.add("badge-1");
    else if (count === 2) badge.classList.add("badge-2");
    else if (count === 3) badge.classList.add("badge-3");
    else badge.classList.add("badge-4");

  });
}

// ===============================
// BUSCA FANOUT
// ===============================
fanoutInput.addEventListener("input", () => {

  const termo = fanoutInput.value.toUpperCase().trim();
  listaFanoutsBusca.innerHTML = "";

  if (!termo) return;

  const filtrados = todosFanouts.filter(f => f.includes(termo));

  const grid = document.createElement("div");
  grid.className = "fanout-grid";

  filtrados.forEach(codigo => {

    const div = document.createElement("div");
    div.className = "fanout-chip";

    const span = document.createElement("span");
    span.innerText = codigo;

    const badge = document.createElement("span");
    badge.className = "badge-fanout badge-0";
    badge.innerText = "0";

    div.appendChild(span);
    div.appendChild(badge);

    div.addEventListener("click", () => {

      adicionarSelecionado(codigo);

      div.remove();

    });

    div.setAttribute("draggable", true);
    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("fanout", codigo);

      setTimeout(() => {
        div.remove();
      }, 0);

      adicionarSelecionado(codigo);

    });

    grid.appendChild(div);

  });

  listaFanoutsBusca.appendChild(grid);

});

// ===============================
// OPERADORES
// ===============================
function criarTag(op) {

  const nome = typeof op === "string"
    ? op
    : (op.nome || "");

  const ops = typeof op === "string"
    ? "Sem OPS"
    : (op.ops || "Sem OPS");

  const div = document.createElement("div");

  div.className = "operador-tag";

  if (!nome) return document.createElement("div");

  div.innerText = formatarNome(nome);

  // div.title = `Ops${ops}`;
  div.setAttribute("data-bs-toggle", "popover");

  div.setAttribute("data-bs-trigger", "click");

  div.setAttribute("data-bs-placement", "top");

  div.setAttribute("data-bs-content", `Ops${ops}`);
  new bootstrap.Popover(div);
  console.log(nome, ops);

  div.setAttribute("draggable", true);


  div.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("operador", nome);
  });

  return div;
}
function renderOperadores(lista) {

  const destino = document.querySelector('[data-funcao="sem_funcao"]');

  destino.innerHTML = "";

  lista.sort((a, b) =>
    (a.nome || "").localeCompare(b.nome || "")
  );

  lista.forEach(op => {

    destino.appendChild(criarTag(op));
    atualizarContadoresFuncoes();

  });

}
// ===============================
// MESA
// ===============================
function criarLinhaMesa(numero) {

  const linha = document.createElement("div");
  linha.className = "linha-mesa";

  linha.innerHTML = `
<div class="mesa">
  <div class="numero-mesa">Mesa ${numero} Esquerda</div>
  <div class="fanouts-mesa"></div>
  <div class="posicoes">
    <div class="funcao drop-pesca">Pesca:</div>
    <div class="funcao drop-bipe">Bipe:</div>
  </div>
</div>

<div></div>

<div class="mesa">
  <div class="numero-mesa">Mesa ${numero} Direita</div>
  <div class="fanouts-mesa"></div>
  <div class="posicoes">
    <div class="funcao drop-pesca">Pesca:</div>
    <div class="funcao drop-bipe">Bipe:</div>
  </div>
</div>
`;

  // ===============================
  // FANOUT DROP
  // ===============================
  linha.querySelectorAll(".fanouts-mesa").forEach(area => {

    area.addEventListener("dragover", (e) => e.preventDefault());

    area.addEventListener("drop", (e) => {

      e.preventDefault();

      const codigo = e.dataTransfer.getData("fanout");
      if (!codigo) return;

      const existe = Array.from(area.children)
        .some(el =>
          el.querySelector(".fanout-codigo")?.innerText === codigo
        );

      if (existe) return;

      const tag = criarFanoutTag(codigo);
      area.appendChild(tag);

      adicionarSelecionado(codigo);

      contagemFanout[codigo] = (contagemFanout[codigo] || 0) + 1;

      atualizarBadge();
      salvarAutosave();
    });

  });

  // ===============================
  // OPERADOR DROP (MESA)
  // ===============================
  linha.querySelectorAll(".drop-pesca, .drop-bipe").forEach(area => {

    area.addEventListener("dragover", (e) => e.preventDefault());

    area.addEventListener("drop", (e) => {

      e.preventDefault();

      const nome = e.dataTransfer.getData("operador");
      if (!nome) return;

      const curto = formatarNome(nome);

      // remove de todas mesas
      document.querySelectorAll(".drop-pesca, .drop-bipe").forEach(a => {
        Array.from(a.children).forEach(el => {
          if (el.innerText === curto) el.remove();
        });
      });

      // pesca = único
      if (area.classList.contains("drop-pesca")) {
        area.innerHTML = "Pesca:";
      }
      document.querySelectorAll(".drop-funcao").forEach(f => {

        Array.from(f.children).forEach(el => {

          if (el.innerText === curto) {
            el.remove();
          }

        });

      });
      area.appendChild(criarTag(nome));
      const funcaoDestino = area.classList.contains("drop-pesca")
        ? (
          area.closest(".mesa")
            .querySelector(".numero-mesa")
            .innerText.includes("Esquerda")
            ? "pesca_e"
            : "pesca_d"
        )
        : (
          area.closest(".mesa")
            .querySelector(".numero-mesa")
            .innerText.includes("Esquerda")
            ? "bipe_e"
            : "bipe_d"
        );

      const coluna = document.querySelector(
        `[data-funcao="${funcaoDestino}"]`
      );

      if (coluna) {
        coluna.appendChild(criarTag(nome));
      }
      salvarAutosave();
    });

  });

  return linha;
}

// ===============================
// DROP NAS FUNÇÕES (COLUNA ESQ)
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".drop-funcao").forEach(area => {

    area.addEventListener("dragover", (e) => e.preventDefault());

    area.addEventListener("drop", (e) => {

      e.preventDefault();

      const nome = e.dataTransfer.getData("operador");
      if (!nome) return;

      const curto = formatarNome(nome);

      // remove de mesas
      document.querySelectorAll(".drop-pesca, .drop-bipe").forEach(a => {
        Array.from(a.children).forEach(el => {
          if (el.innerText === curto) el.remove();
        });
      });

      // remove de funções
      document.querySelectorAll(".drop-funcao").forEach(f => {
        Array.from(f.children).forEach(el => {
          if (el.innerText === curto) el.remove();
        });
      });

      // adiciona na função
      area.appendChild(criarTag(nome));
      atualizarContadoresFuncoes();

    });

  });

});

// ===============================
btnAddMesa.onclick = () => {
  containerMesas.appendChild(criarLinhaMesa(contadorMesa));
  contadorMesa++;

  salvarAutosave();
};
btnSalvarLayout.onclick = salvarLayout;
btnNovoLayout.onclick = novoLayout;
// ===============================
// CARREGAR
// ===============================
async function carregarFanouts() {
  const { data } = await db.from("tos").select("codigo");
  todosFanouts = (data || []).map(f => f.codigo);
}

async function carregarOperadores() {
  const { data } = await db.from("operadores").select("*");
  todosOperadores = data || [];
  renderOperadores(todosOperadores);
}
function salvarAutosave() {

  const mesas = [];

  document.querySelectorAll(".linha-mesa").forEach(linha => {

    const mesasLinha = linha.querySelectorAll(".mesa");

    mesasLinha.forEach(mesa => {

      const titulo = mesa.querySelector(".numero-mesa")?.innerText;

      const fanouts = Array.from(
        mesa.querySelectorAll(".fanouts-mesa .fanout-codigo")
      ).map(el => el.innerText);

      const pesca = Array.from(
        mesa.querySelectorAll(".drop-pesca .operador-tag")
      ).map(el => el.innerText);

      const bipe = Array.from(
        mesa.querySelectorAll(".drop-bipe .operador-tag")
      ).map(el => el.innerText);

      mesas.push({
        titulo,
        fanouts,
        pesca,
        bipe
      });

    });

  });
  console.log("AUTOSAVE", mesas);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(mesas)
  );

}
async function salvarLayout() {

  const nome = prompt("Nome do layout:");

  if (!nome) return;

  const mesas = [];

  document.querySelectorAll(".linha-mesa").forEach(linha => {

    const mesasLinha = linha.querySelectorAll(".mesa");

    mesasLinha.forEach(mesa => {

      const titulo = mesa.querySelector(".numero-mesa")?.innerText;

      const fanouts = Array.from(
        mesa.querySelectorAll(".fanouts-mesa .fanout-tag span")
      ).map(el => el.innerText);

      const pesca = Array.from(
        mesa.querySelectorAll(".drop-pesca .operador-tag")
      ).map(el => el.innerText);

      const bipe = Array.from(
        mesa.querySelectorAll(".drop-bipe .operador-tag")
      ).map(el => el.innerText);

      mesas.push({
        titulo,
        fanouts,
        pesca,
        bipe
      });

    });

  });

  await db.from("layouts_esteira").insert([{
    nome,
    dados: mesas
  }]);

  alert("Layout salvo");

}
function novoLayout() {

  const confirmar = confirm(
    "Limpar layout atual e começar novo?"
  );

  if (!confirmar) return;

  containerMesas.innerHTML = "";

  listaFanoutsSelecionados.innerHTML = "";

  contagemFanout = {};

  localStorage.removeItem(STORAGE_KEY);

  contadorMesa = 1;

  btnAddMesa.click();

}
function restaurarAutosave() {

  const salvo = localStorage.getItem(STORAGE_KEY);

  if (!salvo) return false;

  const mesas = JSON.parse(salvo);

  containerMesas.innerHTML = "";

  contadorMesa = 1;
  contagemFanout = {};
  listaFanoutsSelecionados.innerHTML = "";

  for (let i = 0; i < mesas.length; i += 2) {

    const numero = (i / 2) + 1;

    const linha = criarLinhaMesa(numero);

    containerMesas.appendChild(linha);

    const mesaEsquerda = linha.querySelectorAll(".mesa")[0];
    const mesaDireita = linha.querySelectorAll(".mesa")[1];

    const dadosEsquerda = mesas[i];
    const dadosDireita = mesas[i + 1];

    if (dadosEsquerda) {

      const area = mesaEsquerda.querySelector(".fanouts-mesa");

      dadosEsquerda.fanouts.forEach(codigo => {

        console.log("ESQ", codigo);

        adicionarSelecionado(codigo);
        area.appendChild(criarFanoutTag(codigo));
        contagemFanout[codigo] =
          (contagemFanout[codigo] || 0) + 1;
      });

    }

    if (dadosDireita) {

      const area = mesaDireita.querySelector(".fanouts-mesa");

      dadosDireita.fanouts.forEach(codigo => {

        console.log("DIR", codigo);

        adicionarSelecionado(codigo);
        area.appendChild(criarFanoutTag(codigo));
        contagemFanout[codigo] =
          (contagemFanout[codigo] || 0) + 1;
      });

    }

    contadorMesa++;

  }
  atualizarBadge();
  return true;

}

function atualizarContadoresFuncoes() {

  document.querySelectorAll(".grupo-funcao").forEach(grupo => {

    const area = grupo.querySelector(".drop-funcao");

    const badge = grupo.querySelector(".badge-funcao");

    if (!area || !badge) return;

    badge.innerText = area.children.length;

  });

}

// ===============================
window.onload = () => {

  carregarFanouts();
  carregarOperadores();

  const restaurou = restaurarAutosave();

  if (!restaurou) {
    btnAddMesa.click();
  }
  atualizarContadoresFuncoes();

  const popoverTriggerList = document.querySelectorAll(
    '[data-bs-toggle="popover"]'
  );

  [...popoverTriggerList].forEach(el => {

    new bootstrap.Popover(el);

  });
  document.addEventListener("click", (e) => {

    const clicouNoPopover = e.target.closest(".popover");

    const clicouNoOperador = e.target.closest(".operador-tag");

    if (clicouNoPopover || clicouNoOperador) {
      return;
    }

    document.querySelectorAll(".operador-tag").forEach(el => {

      const pop = bootstrap.Popover.getInstance(el);

      if (pop) {
        pop.hide();
      }

    });

  });
};