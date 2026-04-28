import { navigate } from "../../core/router.js";
import apiClient from "../../core/apiClient.js";

export function renderLogin() {
  document.body.classList.add("no-header");
  const app = document.getElementById("app");

  app.innerHTML = `
    <main class="login-page">
      <div class="auth-orb auth-orb--top"></div>
      <div class="auth-orb auth-orb--bottom"></div>

      <article class="login-card">
        <header class="login-card__header">
          <img src="/assets/images/logo.png" alt="Logo" class="login-card__logo" />
          <img src="/assets/images/La_Rivera.png" alt="La Rivera" class="login-card__brand" />
        </header>

        <div class="login-card__hero">
          <span class="auth-badge">Acceso seguro</span>
          <h1 class="login-card__title">Bienvenido de <span>vuelta</span></h1>
          <p class="login-card__subtitle">Gestiona tu inventario desde un solo lugar</p>
        </div>

        <section class="login-card__form">
          <form id="loginForm" class="login-form">
            <div class="login-form__group">
              <label class="login-form__label">Correo electrónico</label>
              <input type="email" name="email" placeholder="hola@larivera.com" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <label class="login-form__label">Contraseña</label>
              <input type="password" name="password" placeholder="••••••••" required class="login-form__input" />
            </div>
            <a href="#" class="login-form__forgot">¿Olvidaste tu contraseña?</a>
            <button type="submit" class="btn btn--primary btn--full">Iniciar sesión →</button>
          </form>
        </section>

        <div class="login-card__separator">
          <span>o continúa con</span>
        </div>

        <nav class="login-card__social">
          <a href="#" class="social-login__link">
            <img src="/assets/images/google.png" alt="Google" class="social-login__icon" />
          </a>
          <a href="#" class="social-login__link">
            <img src="/assets/images/facebook.png" alt="Facebook" class="social-login__icon" />
          </a>
          <a href="#" class="social-login__link">
            <img src="/assets/images/linkedin.png" alt="LinkedIn" class="social-login__icon" />
          </a>
        </nav>

        <footer class="login-card__footer">
          <p>¿No tienes cuenta? <a href="#" class="link" id="btnRegistro">Regístrate aquí</a></p>
        </footer>
      </article>
    </main>
  `;

  document.getElementById("btnRegistro").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/register");
  });

  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.textContent = "Iniciando sesión...";
    submitBtn.disabled = true;

    try {
      const datos = {
        email: new FormData(loginForm).get("email"),
        password: new FormData(loginForm).get("password"),
      };

      const result = await apiClient.login(datos);

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      navigate("/dashboard");

    } catch (error) {
      alert("❌ " + (error.message || "Credenciales inválidas"));
    } finally {
      submitBtn.textContent = "Iniciar sesión →";
      submitBtn.disabled = false;
    }
  });
}