  import { navigate } from "../../core/router.js";

export function renderLanding() {

  document.body.classList.remove("no-header"); // ← agregada aquí

  const app = document.getElementById("app");

  app.innerHTML = `
    <header class="header">
      <div class="header__logo">
        <img src="/src/assets/images/logo.png" alt="Logo" class="header__logo-img" />
      </div>
      <nav class="header__nav">
        <a href="#inicio" class="header__nav-link">Inicio</a>
        <a href="#productos" class="header__nav-link">Productos</a>
        <a href="#tutorial" class="header__nav-link">Cómo Usar</a>
        <a href="#contacto" class="header__nav-link">Contacto</a>
      </nav>
      <div class="header__login">
        <button class="btn btn--login" id="btnLogin">Iniciar Sesión</button>
      </div>
      <div class="header__hamburger">
        <div class="header__hamburger-icon">
          <span></span><span></span><span></span>
        </div>
      </div>
    </header>

    <main class="container">
      <section id="inicio" class="hero section">
        <div class="hero__content">
          <h1 class="hero__title">Gestión de Inventarios LA RIVERA</h1>
          <h2 class="hero__subtitle">Organiza y controla tus productos</h2>
          <p class="hero__description">
            Una app diseñada para mantener tu inventario al día y facilitar la gestión.
          </p>
          <div style="display:flex; gap:1rem; margin-top:2rem">
            <button class="btn btn--primary" id="btnComenzar">Comenzar ahora</button>
            <button class="btn btn--secondary">Saber más</button>
          </div>
        </div>
        <div class="hero__image">
          <img src="/src/assets/images/inventory.png" alt="Dashboard" />
        </div>
      </section>

      <section id="productos" class="section">
        <h2 class="section__title">Nuestros Productos</h2>
        <div class="products-grid">
          <article class="product-card">
            <img src="/src/assets/images/fondo_coca.jpg" alt="Fondo Coca" class="product-card__img" />
            <img src="/src/assets/images/coca.png" alt="Coca" class="product-card__img" />
          </article>
          <article class="product-card">
            <img src="/src/assets/images/fondo-mym.jpg" alt="Fondo M&M" class="product-card__img" />
            <img src="/src/assets/images/m&m-rojo.png" alt="M&M" class="product-card__img" />
          </article>
          <article class="product-card">
            <img src="/src/assets/images/nutella-fondo.jpg" alt="Fondo Nutella" class="product-card__img" />
            <img src="/src/assets/images/nutella.png" alt="Nutella" class="product-card__img" />
          </article>
        </div>
      </section>

      <section id="tutorial" class="promo-section">
        <h2 class="promo-section__title">Tutorial: Cómo usar la app</h2>
        <div class="promo-section__content">
          <article class="promo-section__topic">
            <h3 class="promo-section__topic-title">Agregar productos fácilmente</h3>
            <img src="/src/assets/images/add-product.png" alt="Agregar productos" class="promo-section__topic-image" />
            <p class="promo-section__topic-description">
              Con nuestra app, añadir nuevos productos a tu inventario es rápido y sencillo.
            </p>
          </article>
          <article class="promo-section__topic">
            <h3 class="promo-section__topic-title">Control de stock</h3>
            <img src="/src/assets/images/stock-control.jpg" alt="Control stock" class="promo-section__topic-image" />
            <p class="promo-section__topic-description">
              Monitorea tu inventario en tiempo real y evita quedarte sin productos.
            </p>
          </article>
          <article class="promo-section__topic">
            <h3 class="promo-section__topic-title">Organizar categorías</h3>
            <img src="/src/assets/images/categories.jpg" alt="Categorías" class="promo-section__topic-image" />
            <p class="promo-section__topic-description">
              Clasifica tus productos para encontrarlos fácilmente.
            </p>
          </article>
        </div>
      </section>
    </main>

    <footer id="contacto" class="footer">
      <div class="footer__section">
        <h3 class="footer__title">Compañía</h3>
        <ul class="footer__list">
          <li><a href="#" class="footer__list-link">Sobre nosotros</a></li>
          <li><a href="#" class="footer__list-link">Carreras</a></li>
          <li><a href="#" class="footer__list-link">Contacto</a></li>
          <li><a href="#" class="footer__list-link">Blog</a></li>
        </ul>
      </div>

      <div class="footer__section">
        <h3 class="footer__title">Soporte</h3>
        <ul class="footer__list">
          <li><a href="#" class="footer__list-link">Preguntas frecuentes</a></li>
          <li><a href="#" class="footer__list-link">Política de devoluciones</a></li>
          <li><a href="#" class="footer__list-link">Términos y condiciones</a></li>
          <li><a href="#" class="footer__list-link">Ayuda</a></li>
        </ul>
      </div>

      <div class="footer__section">
        <h3 class="footer__title">Contáctanos</h3>
        <div class="footer__socials">
          <a href="#" class="footer__social-link">
            <img src="/src/assets/images/facebook.png" alt="Facebook" class="footer__social-img" />
          </a>
          <a href="#" class="footer__social-link">
            <img src="/src/assets/images/gmail.png" alt="Gmail" class="footer__social-img" />
          </a>
          <a href="#" class="footer__social-link">
            <img src="/src/assets/images/icons8-whatsapp-48.png" alt="WhatsApp" class="footer__social-img" />
          </a>
          <a href="#" class="footer__social-link">
            <img src="/src/assets/images/linkedin.png" alt="LinkedIn" class="footer__social-img" />
          </a>
        </div>
      </div>

      <p class="footer__copy">&copy; 2025 La Rivera. Todos los derechos reservados.</p>
    </footer>
  `;

  document.getElementById("btnLogin").addEventListener("click", () => navigate("/login"));
  document.getElementById("btnComenzar").addEventListener("click", () => navigate("/login"));

  document.querySelector(".header__hamburger").addEventListener("click", function () {
    this.classList.toggle("active");
    document.querySelector(".header__nav").classList.toggle("active");
  });

  document.querySelectorAll(".header__nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        document.querySelector(".header__hamburger").classList.remove("active");
        document.querySelector(".header__nav").classList.remove("active");
      }
    });
  });
}