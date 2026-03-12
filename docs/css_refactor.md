
# 🧱 1️⃣ Atomic Design Real (Obligatorio)

Jerarquía estricta:

tokens → átomos → moléculas → organismos → layouts → páginas

## 📂 Ubicación obligatoria

- Tokens → styles/base/_variables.css o styles/tokens/
- Átomos → styles/shared/atoms/
- Moléculas → styles/shared/molecules/
- Organismos → styles/shared/organisms/
- Layouts → styles/layouts/
- Específico dashboard → styles/dashboard/
- Específico website → styles/website/

## Reglas

- No mezclar niveles Atomic.
- No duplicar componentes existentes en `shared`.
- Las páginas ensamblan.
- Las vistas no contienen arquitectura visual estructural.
- Los estilos específicos por vista están permitidos, pero deben vivir en su carpeta correspondiente (`dashboard/` o `website/`).
- No forzar reutilización cuando no tiene sentido.

---

# 🏗 2️⃣ Separación Clara de Responsabilidades

- `shared` = componentes reutilizables reales.
- `dashboard` = composición y variaciones específicas del panel.
- `website` = identidad pública.
- `utilities` = reglas utilitarias globales.

No todo debe ir a shared.  
Solo lo verdaderamente reutilizable.

---

# 🧱 3️⃣ Consistencia Absoluta

- BEM estricto en español.
- Un bloque = una responsabilidad.
- No duplicación.
- No mezclar niveles Atomic.
- No decisiones visuales aisladas.
- No dependencias implícitas entre bloques.

---

# ♻️ 4️⃣ Evitar Reutilización Forzada

No convertir todo en átomo, molécula u organismo si no lo necesita.

Arquitectura limpia ≠ sobreingeniería.

No crear abstracciones innecesarias.
No fragmentar componentes sin razón.
No crear componentes genéricos artificiales.

---

# 🔎 5️⃣ Escalabilidad Inteligente

Escalable no significa rígido.

Significa:

- Poder agregar módulos sin caos.
- Identificar fácilmente qué es global y qué es específico.
- No mezclar responsabilidades.
- No generar dependencia entre features.

---

# 🚫 6️⃣ Restricciones Técnicas (No negociables)

- No usar `!important`.
- No duplicar clases.
- No mover archivos sin justificación técnica.
- No romper estructura modular por features.
- No alterar comportamiento JavaScript.
- No cambiar estructura de `SPAViewManager.js`.
- No alterar `router.js`.
- No alterar `dashboard.entry.js`.
- No eliminar clases legacy aún.
- No modificar resultado visual actual.

---

# 🔁 7️⃣ Estrategia de Migración Progresiva

- Mantener clases actuales (inglés o legacy).
- Agregar clases nuevas en español junto a las existentes.
- Marcar clases legacy así:

  /* @obsoleto — reemplazado por .nueva-clase */

- Nunca eliminar una clase vieja hasta que el HTML esté completamente migrado.
- Mantener compatibilidad visual exacta durante todo el proceso.

---

# 🧠 8️⃣ Validaciones Arquitectónicas Obligatorias

Antes de modificar cualquier código, evaluar:

1. ¿Es átomo, molécula u organismo?
2. ¿Ya existe en `shared`?
3. ¿Debe vivir en `shared` o en `dashboard`?
4. ¿Está rompiendo separación de responsabilidades?
5. ¿Es CSS específico que debería ser utilitario?
6. ¿Está generando duplicación implícita?
7. ¿Escalaría si agregamos 5 módulos más?

No modificar sin pasar estas validaciones.

---

# 🛠 9️⃣ Tarea

Refactorizar:

[NOMBRE DEL ARCHIVO]

Debe:

- Aplicar BEM en español.
- Respetar ubicación correcta según arquitectura.
- No romper modularidad JS.
- No romper diseño visual.
- Mantener compatibilidad legacy.
- No crear sobreingeniería.
- No generar dependencia entre features.

---

# 📤 🔟 Formato de Entrega Obligatorio

1. Diagnóstico del archivo actual (nivel Atomic detectado).
2. Problemas arquitectónicos encontrados.
3. Propuesta estructural.
4. HTML refactorizado.
5. CSS refactorizado.
6. Lista de clases marcadas como obsoletas.
7. Justificación técnica detallada.

---

# 🎯 Resultado Esperado

- No mezclar `dashboard` con `shared`.
- No romper el SPA.
- Permitir estilos específicos controlados.
- Mantener arquitectura limpia y escalable.
- Evitar sobreingeniería.
- Pensamiento arquitectónico antes de escribir CSS.

---

# FASE 0.5 — Auditoría CSS (resultados)

## Top 5 archivos más grandes
| Archivo | Líneas |
|---------|--------|
| `shared/organisms/_categorias.css` | 698 |
| `website/organisms/_lp-hero.css` | 269 |
| `dashboard/views/_config-view.css` | 245 |
| `shared/organisms/inventario_dashboard.css` | 240 |
| `website/organisms/_lp-sections.css` | 233 |
**Total CSS:** 5014 líneas en 38 archivos

## Duplicados confirmados
| Selector | Archivo 1 | Archivo 2 | Acción en refactor |
|----------|-----------|-----------|-------------------|
| `.dashboard-sidebar` | `_dashboard-sidebar.css` | `_dashboard.css:19` | fusionar al mover a `components/dashboard` |
| `.btn` | `_lp-buttons.css` | `_categorias.css:649` | eliminar copia en categorias |
| `.card` | `_cards.css` | `_dashboard-main.css:16` | fusionar al mover |
| `.header` | `_header.css` | `_lp-header.css:3` | renombrar lp-header a `.lp-header` en FASE 9 |
| `.form-group` | `_forms.css` | `_categorias.css:598` | eliminar copia en categorias |
| `.animate-in` | `_lp-animations.css` | `_lp-hero.css:243` | eliminar copia en hero |

## Candidatas a eliminar (CSS muerto)
- `.neo-spectrum` — animación removida en commit anterior
- `.mb-1`, `.mb-4`, `.p-2`, `.p-6` — utilities sin uso detectado
- `.btn-volver` — sin referencia en JS/pages
- `.invp-modal-*` (6 clases) — verificar en HTML templates antes de eliminar
- `.stat--lg`, `.stat--sm`, `.stat__label`, etc. — sin referencia JS

## !important
4 usos, todos en `base/_reset.css` dentro de `@media (prefers-reduced-motion)`. Legítimos.

## Conflictos de especificidad
- Selectores sin clase (`div`, `ul`): mínimos (1 ocurrencia de `ul`)
- Anidamiento excesivo `>`: 0 ocurrencias
- `!important` ilegítimo: 0 ocurrencias