const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SDCbRlv4UEOG8YRwiPUh5A_vAXyrpUa";

const { createClient } = supabase;

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase conectado:", db);
async function testarLeitura() {
  const { data, error } = await db
    .from("tos")
    .select("*");

  if (error) {
    console.error("Erro ao buscar:", error);
  } else {
    console.log("Dados encontrados:", data);
  }
}

testarLeitura();