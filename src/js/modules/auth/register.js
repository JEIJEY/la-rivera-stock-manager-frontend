import { navigate } from "../../core/router.js";
import apiClient from "../../core/apiClient.js";

export function renderRegister() {
  document.body.classList.add("no-header");
  const app = document.getElementById("app");

  app.innerHTML = `
    <main class="login-page">
      <article class="login-card">
        <header class="login-card__header">
          <img src="/src/assets/images/logo.png" alt="Logo" class="login-card__logo" />
          <img src="/src/assets/images/La_Rivera.png" alt="La Rivera" class="login-card__brand" />
        </header>

        <section class="login-card__form">
          <h1 class="login-card__title">Regístrate</h1>
          <form id="registerForm" class="login-form">
            <div class="login-form__group">
              <input type="text" name="nombres" placeholder="Nombres" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <input type="text" name="apellidos" placeholder="Apellidos" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <input type="text" name="cedula" placeholder="Cédula" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <input type="date" name="fechaNacimiento" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <input type="email" name="email" placeholder="Correo" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <input type="password" name="password" placeholder="Contraseña" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" required class="login-form__input" />
            </div>
            <button type="submit" class="btn btn--primary btn--full">Registrarse</button>
          </form>
        </section>

        <div class="login-card__separator">
          <span>o regístrate con</span>
        </div>

        <nav class="login-card__social">
          <a href="#" class="social-login__link">
            <img src="/src/assets/images/google.png" alt="Google" class="social-login__icon" />
          </a>
          <a href="#" class="social-login__link">
            <img src="/src/assets/images/facebook.png" alt="Facebook" class="social-login__icon" />
          </a>
          <a href="#" class="social-login__link">
            <img src="/src/assets/images/linkedin.png" alt="LinkedIn" class="social-login__icon" />
          </a>
        </nav>

        <footer class="login-card__footer">
          <p>¿Ya tienes cuenta? <a href="#" class="link" id="btnLogin">Inicia sesión</a></p>
        </footer>
      </article>
    </main>
  `;

  document.getElementById("btnLogin").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/login");
  });

  const registerForm = document.getElementById("registerForm");
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.textContent = "Registrando...";
    submitBtn.disabled = true;

    try {
      const formData = new FormData(registerForm);
      const datos = Object.fromEntries(formData.entries());

      if (datos.password !== datos.confirmPassword) {
        alert("❌ Las contraseñas no coinciden");
        return;
      }

      delete datos.confirmPassword;

      await apiClient.register(datos);

      alert("✅ Registro exitoso");
      navigate("/login");

    } catch (error) {
      alert("❌ " + (error.message || "Error al registrar"));
    } finally {
      submitBtn.textContent = "Registrarse";
      submitBtn.disabled = false;
    }
  });
}