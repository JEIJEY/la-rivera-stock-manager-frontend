import { navigate } from "../../core/router.js";

export function renderLanding() {

  document.body.classList.remove("no-header");

  const app = document.getElementById("app");

  app.innerHTML = `

    <!-- ATOMS: Ambient Background -->
    <div class="glow-orb glow-orb--top"></div>
    <div class="glow-orb glow-orb--mid"></div>

    <!-- ORGANISM: Header -->
    <header class="header">
      <div class="header__brand">
  <span class="header__brand-dot"></span>
  <img src="/assets/images/logo.png" alt="Logo" class="header__brand-img" />
  La Rivera
</div>

      <nav class="header__nav">
        <a href="#inicio"        class="header__nav-link">Inicio</a>
        <a href="#productos"     class="header__nav-link">Productos</a>
        <a href="#como-funciona" class="header__nav-link">Cómo Funciona</a>
        <a href="#contacto"      class="header__nav-link">Contacto</a>
      </nav>

      <div class="header__actions">
        <button class="btn btn--ghost" id="btnLogin">Iniciar Sesión</button>
      </div>

      <div class="header__hamburger">
        <div class="header__hamburger-icon">
          <span></span><span></span><span></span>
        </div>
      </div>
    </header>

    <!-- ORGANISM: Hero -->
    <section id="inicio" class="hero section">
      <div class="hero__bg">
        <div class="hero__bg-glow"></div>
        <div class="hero__bg-gradient"></div>
      </div>

      <div class="hero__grid">

        <!-- Columna izquierda -->
        <div class="hero__content animate-in">
          <div class="badge badge--outline">
            <span class="badge__dot"></span>
            Sistema de inventario inteligente
          </div>

          <h1 class="hero__title">
            Controla tu tienda<br />
            <span class="hero__title-accent">sin complicaciones</span>
          </h1>

          <p class="hero__description">
            La Rivera te ayuda a gestionar productos, stock y ventas desde un
            solo lugar. Diseñado para tiendas que quieren crecer.
          </p>

          <div class="hero__actions">
            <button class="btn btn--primary btn--lg">Comenzar gratis →</button>
            <a href="#como-funciona" class="btn btn--ghost btn--lg">Ver cómo funciona</a>
          </div>

          <div class="hero__stats animate-in delay-3">
            <div>
              <div class="hero__stat-number">500+</div>
              <div class="hero__stat-label">Productos gestionados</div>
            </div>
            <div>
              <div class="hero__stat-number">24/7</div>
              <div class="hero__stat-label">Acceso total</div>
            </div>
            <div>
              <div class="hero__stat-number">100%</div>
              <div class="hero__stat-label">Control real</div>
            </div>
          </div>
        </div>

        <!-- Columna derecha -->
        <div class="hero__visual animate-in delay-2">
          <div class="hero__card">
            <div class="hero__card-header">
              <span class="hero__card-title">📦 Inventario</span>
              <span class="badge badge--green">En vivo</span>
            </div>

            <div class="hero__card-items">
              <div class="hero__card-item">
                <div class="hero__card-icon hero__card-icon--green">🥤</div>
                <div class="hero__card-item-info">
                  <div class="hero__card-item-name">Coca-Cola 350ml</div>
                  <div class="hero__card-item-meta">Bebidas</div>
                </div>
                <div class="hero__card-item-stock hero__card-item-stock--ok">48</div>
              </div>

              <div class="hero__card-item">
                <div class="hero__card-icon hero__card-icon--orange">🍫</div>
                <div class="hero__card-item-info">
                  <div class="hero__card-item-name">Nutella 250g</div>
                  <div class="hero__card-item-meta">Snacks</div>
                </div>
                <div class="hero__card-item-stock hero__card-item-stock--low">12</div>
              </div>

              <div class="hero__card-item">
                <div class="hero__card-icon hero__card-icon--blue">🍬</div>
                <div class="hero__card-item-info">
                  <div class="hero__card-item-name">M&amp;M's Original</div>
                  <div class="hero__card-item-meta">Dulces</div>
                </div>
                <div class="hero__card-item-stock hero__card-item-stock--crit">3</div>
              </div>
            </div>
          </div>

          <div class="hero__float hero__float--top">
            <div class="hero__float-icon" style="background: rgba(0,217,139,0.15)">✓</div>
            <span style="color: #00d98b">Stock actualizado</span>
          </div>

          <div class="hero__float hero__float--bottom">
            <div class="hero__float-icon" style="background: rgba(245,166,35,0.15)">⚠</div>
            <span style="color: #f5a623">Nutella: stock bajo</span>
          </div>
        </div>

      </div>
    </section>

    <!-- ORGANISM: Features -->
    <section class="features section">
      <div class="features__header">
        <span class="section__overline">Funcionalidades</span>
        <h2 class="section__title">Todo lo que necesita tu tienda</h2>
        <p class="section__subtitle">
          Herramientas diseñadas para que manejes tu negocio sin complicaciones.
        </p>
      </div>

      <div class="features__grid">
        <div class="feature-card animate-in delay-1">
          <div class="feature-card__icon">📊</div>
          <h3 class="feature-card__title">Control de inventario</h3>
          <p class="feature-card__text">
            Agrega, edita y organiza tus productos. Siempre sabrás qué tienes y qué necesitas reponer.
          </p>
        </div>

        <div class="feature-card animate-in delay-2">
          <div class="feature-card__icon">📦</div>
          <h3 class="feature-card__title">Categorías inteligentes</h3>
          <p class="feature-card__text">
            Organiza por tipo: bebidas, snacks, aseo, granos. Encuentra cualquier producto en segundos.
          </p>
        </div>

        <div class="feature-card animate-in delay-3">
          <div class="feature-card__icon">🔔</div>
          <h3 class="feature-card__title">Alertas de stock</h3>
          <p class="feature-card__text">
            Recibe notificaciones cuando un producto esté por agotarse. Nunca más pierdas una venta.
          </p>
        </div>

        <div class="feature-card animate-in delay-1">
          <div class="feature-card__icon">📈</div>
          <h3 class="feature-card__title">Reportes y métricas</h3>
          <p class="feature-card__text">
            Visualiza las tendencias de tu negocio. Qué se vende más, qué se estanca, y toma decisiones.
          </p>
        </div>

        <div class="feature-card animate-in delay-2">
          <div class="feature-card__icon">👥</div>
          <h3 class="feature-card__title">Multi-usuario</h3>
          <p class="feature-card__text">
            Agrega empleados con roles específicos. Tú decides quién puede ver y editar qué.
          </p>
        </div>

        <div class="feature-card animate-in delay-3">
          <div class="feature-card__icon">📱</div>
          <h3 class="feature-card__title">Acceso desde cualquier lugar</h3>
          <p class="feature-card__text">
            Funciona en tu celular, tablet o computador. Revisa tu tienda desde donde estés.
          </p>
        </div>
      </div>
    </section>

    <!-- ORGANISM: Products -->
    <section id="productos" class="products section">
      <div class="products__header">
        <span class="section__overline">Nuestros productos</span>
        <h2 class="section__title">Lo que mueve a La Rivera</h2>
        <p class="section__subtitle">Algunos de los productos que gestionamos a diario.</p>
      </div>

      <div class="products__grid">
        <div class="product-card animate-in delay-1">
          <div class="product-card__image-wrap">
            <img src="/assets/images/fondo_coca.jpg" alt="Fondo Coca" class="product-card__bg" />
            <img src="/assets/images/coca.png" alt="Coca-Cola" class="product-card__fg" />
            <div class="product-card__overlay"></div>
            <span class="badge badge--stock">48 uds</span>
          </div>
          <div class="product-card__info">
            <div class="product-card__name">Coca-Cola 350ml</div>
            <div class="product-card__category">Bebidas</div>
          </div>
        </div>

        <div class="product-card animate-in delay-2">
          <div class="product-card__image-wrap">
            <img src="/assets/images/fondo-mym.jpg" alt="Fondo M&M" class="product-card__bg" />
            <img src="/assets/images/m&m-rojo.png" alt="M&M" class="product-card__fg" />
            <div class="product-card__overlay"></div>
            <span class="badge badge--stock">12 uds</span>
          </div>
          <div class="product-card__info">
            <div class="product-card__name">M&amp;M's Original</div>
            <div class="product-card__category">Dulces</div>
          </div>
        </div>

        <div class="product-card animate-in delay-3">
          <div class="product-card__image-wrap">
            <img src="/assets/images/nutella-fondo.jpg" alt="Fondo Nutella" class="product-card__bg" />
            <img src="/assets/images/nutella.png" alt="Nutella" class="product-card__fg" />
            <div class="product-card__overlay"></div>
            <span class="badge badge--stock">3 uds</span>
          </div>
          <div class="product-card__info">
            <div class="product-card__name">Nutella 250g</div>
            <div class="product-card__category">Snacks</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ORGANISM: How it works -->
    <section id="como-funciona" class="how-it-works section">
      <div class="how-it-works__header">
        <span class="section__overline">Cómo funciona</span>
        <h2 class="section__title">3 pasos para tomar el control</h2>
        <p class="section__subtitle">Empieza en minutos, sin configuraciones complicadas.</p>
      </div>

      <div class="steps">
        <div class="step animate-in delay-1">
          <div class="step__number">1</div>
          <h3 class="step__title">Crea tu cuenta</h3>
          <p class="step__text">Regístrate gratis y configura tu tienda en menos de 2 minutos.</p>
        </div>

        <div class="step animate-in delay-2">
          <div class="step__number">2</div>
          <h3 class="step__title">Agrega productos</h3>
          <p class="step__text">Carga tu inventario con categorías, precios y cantidades.</p>
        </div>

        <div class="step animate-in delay-3">
          <div class="step__number">3</div>
          <h3 class="step__title">Gestiona todo</h3>
          <p class="step__text">Controla stock, movimientos y reportes desde un solo panel.</p>
        </div>
      </div>
    </section>

    <!-- ORGANISM: Trust stats -->
    <section class="trust section">
      <div class="trust__grid">
        <div class="trust__item animate-in delay-1">
          <div class="trust__number">500+</div>
          <div class="trust__label">Productos registrados</div>
        </div>
        <div class="trust__item animate-in delay-2">
          <div class="trust__number">50+</div>
          <div class="trust__label">Categorías activas</div>
        </div>
        <div class="trust__item animate-in delay-3">
          <div class="trust__number">99.9%</div>
          <div class="trust__label">Uptime del sistema</div>
        </div>
        <div class="trust__item animate-in delay-4">
          <div class="trust__number">0</div>
          <div class="trust__label">Productos perdidos</div>
        </div>
      </div>
    </section>

    <!-- ORGANISM: CTA -->
    <section class="cta section">
      <div class="cta__glow"></div>
      <div class="cta__content animate-in">
        <span class="section__overline">¿Listo para empezar?</span>
        <h2 class="section__title">
          Tu tienda merece<br />un sistema profesional
        </h2>
        <p class="section__subtitle">
          Empieza a controlar tu inventario hoy. Es gratis, es fácil, y está hecho para ti.
        </p>
        <div class="cta__actions">
          <button class="btn btn--primary btn--lg">Crear cuenta gratis →</button>
          <a href="#contacto" class="btn btn--ghost btn--lg">Hablar con nosotros</a>
        </div>
      </div>
    </section>

    <!-- ORGANISM: Footer -->
    <footer id="contacto" class="footer">
      <div class="footer__grid">
        <div>
          <div class="footer__brand">
            <span class="header__brand-dot"></span>
            La Rivera
          </div>
          <p class="footer__desc">
            Sistema de gestión de inventarios diseñado para tiendas que quieren crecer.
          </p>
          <div class="footer__socials">
            <a href="#" class="footer__social">
              <img src="/assets/images/facebook.png" alt="Facebook" />
            </a>
            <a href="#" class="footer__social">
              <img src="/assets/images/gmail.png" alt="Gmail" />
            </a>
            <a href="#" class="footer__social">
              <img src="/assets/images/icons8-whatsapp-48.png" alt="WhatsApp" />
            </a>
            <a href="#" class="footer__social">
              <img src="/assets/images/linkedin.png" alt="LinkedIn" />
            </a>
          </div>
        </div>

        <div>
          <h4 class="footer__title">Producto</h4>
          <a href="#" class="footer__link">Funcionalidades</a>
          <a href="#" class="footer__link">Precios</a>
          <a href="#" class="footer__link">Actualizaciones</a>
        </div>

        <div>
          <h4 class="footer__title">Compañía</h4>
          <a href="#" class="footer__link">Sobre nosotros</a>
          <a href="#" class="footer__link">Blog</a>
          <a href="#" class="footer__link">Contacto</a>
        </div>

        <div>
          <h4 class="footer__title">Soporte</h4>
          <a href="#" class="footer__link">Ayuda</a>
          <a href="#" class="footer__link">FAQ</a>
          <a href="#" class="footer__link">Términos</a>
        </div>
      </div>

      <div class="footer__bottom">
        <span class="footer__copy">© 2025 La Rivera. Todos los derechos reservados.</span>
        <span class="footer__copy">Hecho con 💚 para tiendas que crecen</span>
      </div>
    </footer>
  `;

  // Solo btnLogin está funcionando
  document.getElementById("btnLogin").addEventListener("click", () => navigate("/login"));

  // Hamburger mobile
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
