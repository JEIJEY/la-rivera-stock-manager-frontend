export const abcView = {
  renderStats(stats, porcentajes) {
    const clases = ["A", "B", "C"];
    clases.forEach((clase) => {
      const count = document.getElementById(`count-${clase}`);
      const subtitle = document.querySelector(`.invp-abc-card--${clase} .invp-abc-card__subtitle`);
      const fill = document.querySelector(`.invp-abc-card--${clase} .fill`);

      if (count) count.textContent = stats[clase];
      if (subtitle) subtitle.textContent = `${porcentajes[clase]}% del total`;
      if (fill) fill.style.width = `${porcentajes[clase]}%`;
    });
  },

  setBtnEstado(btn, cargando) {
    if (!btn) return;
    btn.innerHTML = cargando ? "⏳ Calculando..." : "🔄 Actualizar ABC";
    btn.disabled = cargando;
  },
};