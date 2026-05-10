/**
 * barcodeScanner.js — Componente compartido de escaneo de código de barras
 *
 * Soporta dos modos:
 *  - Cámara: usa @zxing/browser (importación dinámica, solo carga al abrir la tab)
 *  - USB/Manual: detecta escritura rápida de lectores físicos (< 100ms entre teclas)
 *
 * Uso:
 *   import { crearEscaner } from "../shared/barcodeScanner.js";
 *   const escaner = crearEscaner({
 *     onScan: async (codigo) => { ... },
 *     onError: (msg) => { ... }, // opcional
 *   });
 *   escaner.abrir();
 */

const MODAL_ID = "barcodeModalEscaner";

/** Emite un pitido corto usando Web Audio API */
function beep({ frecuencia = 1800, duracion = 80, volumen = 0.3 } = {}) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = frecuencia;
    gain.gain.setValueAtTime(volumen, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duracion / 1000);
    ctx.close();
  } catch (_) { /* navegador sin soporte de audio */ }
}

export function crearEscaner({ onScan, onError } = {}) {
  let dialog = null;
  let reader = null;        // BrowserMultiFormatReader instance
  let stream = null;        // MediaStream activo
  let modoActivo = "camara";
  let yaEscaneado = false;  // evita múltiples disparos en una misma apertura

  // ─── Estado del buffer USB ───────────────────────────────────────────
  let usbBuffer = "";
  let usbLastTime = 0;
  let usbTimer = null;
  const USB_MAX_GAP_MS = 100;   // gap máximo entre teclas del escáner
  const USB_RESET_MS = 300;     // resetea buffer si no hay tecla por este tiempo
  const USB_MIN_LEN = 3;        // mínimo de caracteres para considerar código válido

  // ─── Helpers ─────────────────────────────────────────────────────────

  function mostrarError(msg) {
    const el = dialog?.querySelector(".bc-estado");
    if (el) {
      el.textContent = msg;
      el.className = "bc-estado bc-estado--error";
    }
    if (onError) onError(msg);
  }

  function mostrarInfo(msg) {
    const el = dialog?.querySelector(".bc-estado");
    if (el) {
      el.textContent = msg;
      el.className = "bc-estado";
    }
  }

  // ─── Cámara ──────────────────────────────────────────────────────────

  async function iniciarCamara() {
    const video = dialog.querySelector("#bcVideo");
    mostrarInfo("Iniciando cámara...");

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      reader = new BrowserMultiFormatReader();

      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = stream;
      await video.play();

      mostrarInfo("Apunta la cámara al código de barras...");

      reader.decodeFromVideoElement(video, (result, err) => {
        if (!result || yaEscaneado) return;
        const codigo = (result.getText() || "").trim();
        if (codigo.length < 3) return; // ignora lecturas erróneas o vacías
        yaEscaneado = true;             // bloquea futuros callbacks de este scan
        beep();
        detenerCamara();
        cerrar();
        onScan(codigo);
        // err es normal mientras no detecta nada — no mostrar al usuario
      });
    } catch (e) {
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        mostrarError("No se pudo acceder a la cámara. Verifica los permisos o usa el modo USB.");
      } else if (e.name === "NotFoundError") {
        mostrarError("No se encontró ninguna cámara. Usa el modo USB.");
      } else {
        mostrarError("Error al iniciar la cámara. Usa el modo USB.");
      }
    }
  }

  function detenerCamara() {
    try { reader?.reset(); } catch (_) {}
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    const video = dialog?.querySelector("#bcVideo");
    if (video) { video.srcObject = null; }
    reader = null;
  }

  // ─── USB / Teclado ────────────────────────────────────────────────────

  function iniciarUSB() {
    const input = dialog.querySelector("#bcUsbInput");
    if (!input) return;
    usbBuffer = "";
    usbLastTime = 0;
    input.value = "";
    // Re-enfocar si pierde el foco mientras el modal sigue abierto
    input.focus();
    input.addEventListener("blur", reEnfocarUSB);
  }

  function reEnfocarUSB() {
    if (dialog && dialog.open && modoActivo === "usb") {
      setTimeout(() => dialog.querySelector("#bcUsbInput")?.focus(), 50);
    }
  }

  function onUsbKeydown(e) {
    if (modoActivo !== "usb" || !dialog?.open) return;

    const ahora = Date.now();
    const gap = ahora - usbLastTime;

    // Resetea buffer si hubo pausa larga (escritura humana)
    if (usbLastTime > 0 && gap > USB_RESET_MS) {
      usbBuffer = "";
    }

    usbLastTime = ahora;
    clearTimeout(usbTimer);

    if (e.key === "Enter") {
      if (usbBuffer.length >= USB_MIN_LEN && !yaEscaneado) {
        const codigo = usbBuffer.trim();
        usbBuffer = "";
        yaEscaneado = true;
        beep();
        cerrar();
        onScan(codigo);
      } else {
        usbBuffer = "";
      }
      return;
    }

    // Acumular solo caracteres imprimibles
    if (e.key.length === 1) {
      usbBuffer += e.key;
    }

    // Auto-reset si pasan 300ms sin Enter
    usbTimer = setTimeout(() => { usbBuffer = ""; }, USB_RESET_MS);
  }

  // ─── Tabs ─────────────────────────────────────────────────────────────

  function cambiarTab(modo) {
    modoActivo = modo;
    const panelCamara = dialog.querySelector(".bc-panel-camara");
    const panelUsb = dialog.querySelector(".bc-panel-usb");
    const tabCamara = dialog.querySelector('[data-mode="camara"]');
    const tabUsb = dialog.querySelector('[data-mode="usb"]');

    if (modo === "camara") {
      panelCamara.hidden = false;
      panelUsb.hidden = true;
      tabCamara.classList.add("is-active");
      tabUsb.classList.remove("is-active");
      iniciarCamara();
    } else {
      detenerCamara();
      panelCamara.hidden = true;
      panelUsb.hidden = false;
      tabCamara.classList.remove("is-active");
      tabUsb.classList.add("is-active");
      iniciarUSB();
    }
  }

  // ─── DOM del modal ────────────────────────────────────────────────────

  function crearDOM() {
    const el = document.createElement("dialog");
    el.id = MODAL_ID;
    el.className = "bc-modal";
    el.innerHTML = `
      <div class="bc-modal__cabecera">
        <h3 class="bc-modal__titulo">Escanear código de barras</h3>
        <button type="button" class="bc-modal__cerrar" aria-label="Cerrar">✕</button>
      </div>
      <div class="bc-modal__tabs">
        <button type="button" class="bc-modal__tab is-active" data-mode="camara">📷 Cámara</button>
        <button type="button" class="bc-modal__tab" data-mode="usb">🔌 USB / Manual</button>
      </div>
      <div class="bc-modal__cuerpo">
        <div class="bc-panel-camara">
          <video id="bcVideo" class="bc-camara" autoplay muted playsinline></video>
          <p class="bc-estado">Iniciando cámara...</p>
        </div>
        <div class="bc-panel-usb" hidden>
          <p class="bc-estado">El lector escribirá automáticamente — o escribe el código manualmente:</p>
          <input id="bcUsbInput" type="text" class="bc-usb__input"
                 placeholder="Escanea o escribe el código y presiona Enter"
                 autocomplete="off" />
        </div>
      </div>
      <div class="bc-modal__pie">
        <button type="button" class="btn btn--ghost bc-modal__cancelar">Cancelar</button>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function obtenerOCrearDialog() {
    return document.getElementById(MODAL_ID) ?? crearDOM();
  }

  // ─── API pública ──────────────────────────────────────────────────────

  function abrir() {
    dialog = obtenerOCrearDialog();

    // Limpiar estado anterior
    detenerCamara();
    modoActivo = "camara";
    yaEscaneado = false;       // reset del flag para esta nueva apertura

    // Wire listeners (idempotente con flag)
    if (!dialog.dataset.wired) {
      dialog.dataset.wired = "true";

      dialog.querySelector(".bc-modal__cerrar").addEventListener("click", cerrar);
      dialog.querySelector(".bc-modal__cancelar").addEventListener("click", cerrar);
      dialog.addEventListener("click", (e) => { if (e.target === dialog) cerrar(); });
      dialog.addEventListener("keydown", onUsbKeydown);

      dialog.querySelectorAll(".bc-modal__tab").forEach((tab) => {
        tab.addEventListener("click", () => cambiarTab(tab.dataset.mode));
      });

      const usbInput = dialog.querySelector("#bcUsbInput");
      if (usbInput) {
        usbInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const codigo = usbInput.value.trim();
            if (codigo.length >= USB_MIN_LEN && !yaEscaneado) {
              usbInput.value = "";
              yaEscaneado = true;
              beep();
              cerrar();
              onScan(codigo);
            }
          }
        });
        usbInput.addEventListener("blur", reEnfocarUSB);
      }
    }

    dialog.showModal();
    cambiarTab("camara");
  }

  function cerrar() {
    detenerCamara();
    clearTimeout(usbTimer);
    usbBuffer = "";
    const input = dialog?.querySelector("#bcUsbInput");
    if (input) input.blur();
    dialog?.close();
  }

  return { abrir, cerrar };
}
