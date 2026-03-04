
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