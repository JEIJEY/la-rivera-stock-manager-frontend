import { navigate } from "../../core/router.js";

export function renderSplash() {
  const app = document.getElementById("app");
  document.body.classList.add("no-header");

  app.innerHTML = `
    <div class="splash">
      <div class="splash__fondo">
        <div class="splash__mascara"></div>
        <div class="splash__vacio">
          <div class="splash__lineas-izq">
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
          </div>
          <div class="splash__lineas-der">
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
          </div>
          <div class="splash__exterior"><div></div></div>
        </div>
        <div class="splash__completo splash__completo--izq">
          <div class="splash__lineas-izq">
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
          </div>
          <div class="splash__lineas-der">
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
          </div>
          <div class="splash__circulo"><div></div></div>
          <div class="splash__exterior"><div></div></div>
          <div class="splash__hexagono">
            <div class="splash__lado splash__lado--1"></div>
            <div class="splash__lado splash__lado--2"></div>
            <div class="splash__lado splash__lado--3"></div>
            <div class="splash__lado splash__lado--4"></div>
            <div class="splash__lado splash__lado--5"></div>
            <div class="splash__lado splash__lado--6"></div>
          </div>
        </div>
        <div class="splash__completo splash__completo--der">
          <div class="splash__lineas-izq">
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
            <div class="splash__linea splash__linea--izq"></div>
          </div>
          <div class="splash__lineas-der">
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
            <div class="splash__linea splash__linea--der"></div>
          </div>
          <div class="splash__circulo"><div></div></div>
          <div class="splash__exterior"><div></div></div>
          <div class="splash__hexagono">
            <div class="splash__lado splash__lado--1"></div>
            <div class="splash__lado splash__lado--2"></div>
            <div class="splash__lado splash__lado--3"></div>
            <div class="splash__lado splash__lado--4"></div>
            <div class="splash__lado splash__lado--5"></div>
            <div class="splash__lado splash__lado--6"></div>
          </div>
        </div>
      </div>

      <div class="splash__logo">
        <svg class="splash__anillo" xmlns="http://www.w3.org/2000/svg" viewBox="-65 -65 130 130">
          <defs>
            <filter id="blur">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <g fill="#00DF81">
            <g class="splash__giro">
              <path filter="url(#blur)" opacity="0.5" d="M 0 40 a 35 35 0 0 1 0 -70 10 10 0 0 0 0 -20 45 45 0 0 0 0 90" />
              <path d="M 0 40 a 39 39 0 0 1 0 -78 2 2 0 0 0 0 -4 41 41 0 0 0 0 82" />
            </g>
          </g>
        </svg>
        <img src="/assets/images/logo.png" alt="La Rivera" class="splash__img" />
      </div>
    </div>
  `;

  setTimeout(() => {
    navigate("/landing");
  }, 4650);
}