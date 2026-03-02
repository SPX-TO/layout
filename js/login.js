

const SUPABASE_URL = "https://lheqsngyllranmhvthsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZXFzbmd5bGxyYW5taHZ0aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODEyMzcsImV4cCI6MjA4NzM1NzIzN30.VkaqrKL-6Hb9zMj-lv2ROQ5Y4v2I-6rXySMqN4wYofk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      message.textContent = "Email ou senha inválidos.";
      return;
    }

    // 🔥 AGORA REDIRECIONA PARA ADMIN
    window.location.href = "admin.html";
  });
});