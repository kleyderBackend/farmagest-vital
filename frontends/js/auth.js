import { apiRequest } from "./api.js";

const formLoginAdmin = document.getElementById("formLoginAdmin");
const emailAdmin = document.getElementById("emailAdmin");
const passwordAdmin = document.getElementById("passwordAdmin");
const authMessage = document.getElementById("authMessage");

function showAuthMessage(message, type = "error") {
  if (!authMessage) {
    alert(message);
    return;
  }

  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

formLoginAdmin.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = emailAdmin.value.trim();
  const password = passwordAdmin.value.trim();

  if (!email || !password) {
    showAuthMessage("Todos los campos son obligatorios");
    return;
  }

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        email,
        password,
      }),
    });

    localStorage.setItem("token", data.login.token);
    localStorage.setItem("user", JSON.stringify(data.login.user));

    showAuthMessage("Inicio de sesión correcto", "success");
    window.location.href = "../dashboardAdmin.html";
  } catch (error) {
    showAuthMessage(error.message || "Credenciales incorrectas");
  }
});
