

const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    message.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // 🔐 Login
    const { error: loginError } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      message.textContent = "Email ou senha inválidos.";
      return;
    }

    // ✅ Pegar sessão consolidada
    const { data: { session }, error: sessionError } = await db.auth.getSession();

    if (sessionError || !session) {
      message.textContent = "Erro ao obter sessão.";
      return;
    }

    const user = session.user;

    // 🔎 Buscar perfil do usuário
    const { data: perfil, error: perfilError } = await db
      .from("usuarios_perfis")
      .select("tipo, esteira_id")
      .eq("id", user.id)
      .single();

    if (perfilError || !perfil) {
      message.textContent = "Perfil não configurado.";
      return;
    }

    // 🚀 Redirecionamento por tipo
    if (perfil.tipo === "admin") {
      window.location.href = "admin.html";
    } else if (perfil.tipo === "esteira") {
      window.location.href = "admin.html";
    } else {
      message.textContent = "Tipo de usuário inválido.";
    }

  });
});