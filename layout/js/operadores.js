// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// INIT
// ========================================

window.addEventListener("DOMContentLoaded", () => {

// ========================================
// SAFE GET
// ========================================

function safe(id){
  return document.getElementById(id);
}

// ========================================
// ELEMENTOS
// ========================================

const nomeInput = safe("nomeOperador");
const sobrenomeInput = safe("sobrenomeOperador");
const funcaoInput = safe("funcaoOperador");
const opsInput = safe("opsOperador");
const idInput = safe("operadorId");

const lista = safe("listaOperadores");

const btnSalvar = safe("btnSalvarOperador");
const btnLimpar = safe("btnLimpar");

const inputCSV = safe("inputPlanilha");

// ========================================
// CARREGAR
// ========================================

async function carregarOperadores(){

const { data, error } = await db
.from("operadores")
.select("*")
.order("nome");

if(error){
  alert(error.message);
  return;
}

if(!lista) return;

lista.innerHTML = "";

data.forEach(op=>{

const nomeCompleto = `${op.nome} ${op.sobrenome || ""}`.trim();

const item = document.createElement("div");
item.className = "list-group-item d-flex justify-content-between align-items-center";

item.innerHTML = `
<div class="d-flex align-items-center gap-2">
<strong>${nomeCompleto}</strong>
<span class="text-muted small">(${op.ops || "-"})</span>
<span class="badge ${op.ativo ? "bg-success" : "bg-danger"}">
${op.ativo ? "Ativo" : "Inativo"}
</span>
</div>

<div>
<button class="btn btn-sm btn-outline-primary me-1">
<i class="bi bi-pencil"></i>
</button>

<button class="btn btn-sm btn-outline-secondary">
<i class="bi bi-arrow-repeat"></i>
</button>
</div>
`;

const btnEditar = item.querySelector(".btn-outline-primary");
const btnToggle = item.querySelector(".btn-outline-secondary");

// EDITAR
if(btnEditar){
  btnEditar.onclick = ()=>{
    if(idInput) idInput.value = op.id;
    if(nomeInput) nomeInput.value = op.nome;
    if(sobrenomeInput) sobrenomeInput.value = op.sobrenome || "";
    if(funcaoInput) funcaoInput.value = op.funcao;
    if(opsInput) opsInput.value = op.ops || "";
  };
}

// ATIVAR / INATIVAR
if(btnToggle){
  btnToggle.onclick = async ()=>{

    await db
    .from("operadores")
    .update({ ativo: !op.ativo })
    .eq("id", op.id);

    carregarOperadores();

  };
}

lista.appendChild(item);

});

}

// ========================================
// SALVAR
// ========================================

if(btnSalvar){
btnSalvar.addEventListener("click", async ()=>{

const nome = nomeInput?.value.trim();
const sobrenome = sobrenomeInput?.value.trim();
const funcao = funcaoInput?.value;
const ops = opsInput?.value.trim();

if(!nome){
  alert("Nome obrigatório");
  return;
}

const id = idInput?.value;

if(id){

await db
.from("operadores")
.update({ nome, sobrenome, funcao, ops })
.eq("id", id);

}else{

await db
.from("operadores")
.insert([{
  nome,
  sobrenome,
  funcao,
  ops,
  ativo: true
}]);

}

limpar();
carregarOperadores();

});
}

// ========================================
// LIMPAR
// ========================================

function limpar(){
if(idInput) idInput.value = "";
if(nomeInput) nomeInput.value = "";
if(sobrenomeInput) sobrenomeInput.value = "";
if(funcaoInput) funcaoInput.value = "inducao";
if(opsInput) opsInput.value = "";
}

if(btnLimpar){
btnLimpar.addEventListener("click", limpar);
}

// ========================================
// IMPORTAR CSV
// ========================================

if(inputCSV){
inputCSV.addEventListener("change", async (e)=>{

const file = e.target.files[0];
if(!file) return;

const text = await file.text();
const linhas = text.split("\n");

let count = 0;

for(let linha of linhas){

linha = linha.trim();
if(!linha) continue;

const [nome, sobrenome, ops, funcao, ativo] = linha.split(",");

if(!nome) continue;

await db.from("operadores").insert([{
  nome: nome.trim(),
  sobrenome: sobrenome?.trim() || "",
  ops: ops?.trim() || "",
  funcao: funcao?.trim() || "inducao",
  ativo: ativo?.trim() === "true"
}]);

count++;

}

alert(count + " importados");

carregarOperadores();

});
}

// ========================================
// INIT FINAL
// ========================================

carregarOperadores();

});