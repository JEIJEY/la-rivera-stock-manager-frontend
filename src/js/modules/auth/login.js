import { navigate } from "../../core/router.js";

export function renderLogin() {
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
          <h1 class="login-card__title">Ingresa</h1>
          <form id="loginForm" class="login-form">
            <div class="login-form__group">
              <input type="email" name="email" placeholder="Correo" required class="login-form__input" />
            </div>
            <div class="login-form__group">
              <input type="password" name="password" placeholder="Contraseña" required class="login-form__input" />
            </div>
            <a href="#" class="login-form__forgot">¿Olvidaste tu contraseña?</a>
            <button type="submit" class="btn btn--primary btn--full">Ingresa</button>
          </form>
        </section>

        <div class="login-card__separator">
          <span>Ingresa con</span>
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
      const formData = new FormData(loginForm);
      const datos = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors?.length) {
          alert("❌ Errores:\n• " + errorData.errors.join("\n• "));
        } else {
          alert("❌ " + (errorData.message || "Credenciales inválidas"));
        }
        return;
      }

      const result = await response.json();

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      navigate("/dashboard");

    } catch (error) {
      alert("💥 Error de conexión con el servidor");
    } finally {
      submitBtn.textContent = "Ingresa";
      submitBtn.disabled = false;
    }
  });
}