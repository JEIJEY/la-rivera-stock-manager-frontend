import { navigate } from "../../core/router.js";
import apiClient from "../../core/apiClient.js";

export function renderRegister() {
  document.body.classList.add("no-header");
  const app = document.getElementById("app");

  app.innerHTML = `
    <main class="login-page">
      <div class="auth-orb auth-orb--top"></div>
      <div class="auth-orb auth-orb--bottom"></div>

      <article class="login-card">
        <header class="login-card__header">
          <img src="/src/assets/images/logo.png" alt="Logo" class="login-card__logo" />
          <img src="/src/assets/images/La_Rivera.png" alt="La Rivera" class="login-card__brand" />
        </header>

        <div class="login-card__hero">
          <span class="auth-badge">Crea tu cuenta</span>
          <h1 class="login-card__title"><span>Empieza</span> gratis hoy</h1>
          <p class="login-card__subtitle">Únete y toma el control de tu tienda</p>
        </div>

        <section class="login-card__form">
          <form id="registerForm" class="login-form">
            <div class="form-row">
              <div class="login-form__group">
                <label class="login-form__label">Nombres</label>
                <input type="text" name="nombres" placeholder="Juan" required class="login-form__input" />
              </div>
              <div class="login-form__group">
                <label class="login-form__label">Apellidos</label>
                <input type="text" name="apellidos" placeholder="García" required class="login-form__input" />
              </div>
            </div>
            <div class="form-row">
              <div class="login-form__group">
                <label class="login-form__label">Cédula</label>
                <input type="text" name="cedula" placeholder="1234567890" required class="login-form__input" />
              </div>
              <div class="login-form__group">
                <label class="login-form__label">Fecha de nac.</label>
                <input type="date" name="fechaNacimiento" required class="login-form__input" />
              </div>
            </div>
            <div class="login-form__group">
              <label class="login-form__label">Correo electrónico</label>
              <input type="email" name="email" placeholder="hola@larivera.com" required class="login-form__input" />
            </div>
            <div class="form-row">
              <div class="login-form__group">
                <label class="login-form__label">Contraseña</label>
                <input type="password" name="password" placeholder="••••••••" required class="login-form__input" />
              </div>
              <div class="login-form__group">
                <label class="login-form__label">Confirmar</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" required class="login-form__input" />
              </div>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Crear cuenta →</button>
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
      submitBtn.textContent = "Crear cuenta →";
      submitBtn.disabled = false;
    }
  });
}