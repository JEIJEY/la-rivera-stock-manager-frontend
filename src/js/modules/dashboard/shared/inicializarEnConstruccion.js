/**
 * Inicializa la vista "En Construcción" compartida.
 * Conecta el botón de navegación al módulo de inventario.
 */
export function inicializarEnConstruccion() {
  const btn = document.getElementById("encBtnVolver");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const linkInventario = document.querySelector(".sidebar-menu__link[data-seccion='inventario']");
    if (linkInventario) {
      linkInventario.click();
    }
  });
}
