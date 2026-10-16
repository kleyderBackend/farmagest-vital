import { apiRequest, getUser, requireAdminSession } from "./api.js";
import { escapeHtml } from "./inventory-utils.js";

const form = document.getElementById("userForm");
const message = document.getElementById("adminMessage");
let users = [];
let selectedId = null;

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `admin-message ${type}`;
}

function resetForm() {
  selectedId = null;
  form.reset();
  document.getElementById("userPassword").required = true;
  document.getElementById("userFormTitle").textContent = "Nuevo usuario";
}

async function loadUsers() {
  const response = await apiRequest("/users");
  users = response.data.users;
  document.getElementById("usersTableBody").innerHTML = users.map((user) =>
    `<tr><td>${escapeHtml(user.full_name)}</td><td>${escapeHtml(user.email)}</td>
      <td>${user.role === "admin" ? "Administrador" : "Personal"}</td><td>${user.is_active ? "Activo" : "Inactivo"}</td>
      <td><button type="button" class="table-action" data-user-edit="${Number(user.user_id)}">Editar</button></td></tr>`,
  ).join("") || '<tr><td colspan="5">No hay usuarios registrados.</td></tr>';
}

document.getElementById("usersTableBody").addEventListener("click", (event) => {
  const button = event.target.closest("[data-user-edit]");
  if (!button) return;
  const user = users.find((entry) => Number(entry.user_id) === Number(button.dataset.userEdit));
  if (!user) return;
  selectedId = user.user_id;
  form.elements.fullName.value = user.full_name;
  form.elements.email.value = user.email;
  form.elements.role.value = user.role;
  form.elements.isActive.checked = Boolean(user.is_active);
  form.elements.password.value = "";
  form.elements.password.required = false;
  document.getElementById("userFormTitle").textContent = "Editar usuario";
  form.scrollIntoView({ behavior: "smooth", block: "center" });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const data = new FormData(form);
    const payload = { fullName: String(data.get("fullName")).trim(), email: String(data.get("email")).trim(),
      role: data.get("role"), isActive: data.get("isActive") === "on" };
    const password = String(data.get("password") || "");
    if (password) payload.password = password;
    await apiRequest(selectedId ? `/users/${selectedId}` : "/users", {
      method: selectedId ? "PUT" : "POST", body: JSON.stringify(payload),
    });
    resetForm();
    await loadUsers();
    showMessage("Usuario guardado con éxito", "success");
  } catch (error) { showMessage(error.message); }
  finally { button.disabled = false; }
});
document.getElementById("newUserButton").addEventListener("click", resetForm);
if (requireAdminSession()) {
  if (getUser()?.role === "admin") loadUsers().catch((error) => showMessage(error.message));
  else { form.hidden = true; showMessage("Solo los administradores pueden gestionar usuarios."); }
}
