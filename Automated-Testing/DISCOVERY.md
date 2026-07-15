# Guía de Discovery de Selectores

> **IMPORTANTE:** Los selectores en `fixtures/login.fixture.ts` son **estimaciones basadas en convenciones** de ASP.NET WebForms. Antes de ejecutar los tests por primera vez, **debes verificar los IDs reales** de los elementos.

## 🔍 Paso 1: Descubrir Selectores Reales con Playwright Codegen

### Opción A: Usar Playwright Inspector (RECOMENDADO)

```powershell
# Desde la carpeta Automated-Testing
npx playwright codegen --viewport-size=1280,720 https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx
```

**Qué hacer:**
1. Se abrirá un navegador Chromium con la página de login
2. Se abrirá Playwright Inspector (panel de grabación)
3. **Haz click en cada elemento** del formulario de login:
   - Campo Email
   - Campo Contraseña
   - Checkbox "Recuérdame"
   - Botón "Iniciar Sesión"
   - Link "¿Olvidaste tu contraseña?"

4. **Copia los selectores** que aparecen en el panel derecho del Inspector
5. Actualiza `fixtures/login.fixture.ts` con los selectores reales

### Opción B: Inspeccionar en el Navegador

1. Abre el navegador y navega a:  
   `https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx`

2. Presiona **F12** para abrir DevTools

3. Usa la herramienta de inspección (flecha en la esquina superior izquierda) y haz click en cada elemento

4. En el HTML, busca el atributo `id` de cada elemento

5. Copia los IDs y actualízalos en `fixtures/login.fixture.ts`

---

## 📝 Selectores a Verificar

### Pantalla de Login

| Elemento | Selector Estimado | Selector Real (actualizar) |
|----------|-------------------|---------------------------|
| Campo Email | `#MainContent_txtEmail` | |
| Campo Contraseña | `#MainContent_txtPassword` | |
| Checkbox Recuérdame | `#MainContent_chkRememberMe` | |
| Botón Iniciar Sesión | `#MainContent_btnLogin` | |
| Link Olvidaste Contraseña | `#MainContent_lnkForgotPassword` | |

### Pantalla Post-Login (Autoreg)

| Elemento | Selector Estimado | Selector Real (actualizar) |
|----------|-------------------|---------------------------|
| Título Bienvenido | `text=Inicio: Bienvenido` | |
| Botón Portal Distribuidor | `text=Portal Distribuidor` | |
| Botón Salida | `text=Salida` | |

### Dashboard Portal Distribuidor

| Elemento | Selector Estimado | Selector Real (actualizar) |
|----------|-------------------|---------------------------|
| Título Dashboard | `text=Dashboard` | |
| Menú Lateral | `.sidebar, nav` | |

---

## 🛠️ Cómo Actualizar los Selectores

### 1. Abrir el archivo fixture:
```powershell
code fixtures\login.fixture.ts
```

### 2. Reemplazar los selectores en el objeto `SEL`:

```typescript
export const SEL = {
  login: {
    emailInput: '#ID_REAL_DEL_CAMPO_EMAIL',        // ← Actualizar aquí
    passwordInput: '#ID_REAL_DEL_CAMPO_PASSWORD',  // ← Actualizar aquí
    // ... resto de selectores
  },
};
```

### 3. Guardar el archivo

---

## ✅ Verificar que los Selectores Funcionan

Una vez actualizados los selectores, ejecuta un test simple para verificar:

```powershell
# Ejecutar solo el primer test de login
npx playwright test login.spec.ts --grep "TC-LOGIN-001" --headed
```

**Si el test falla:**
- Revisa el screenshot en `test-results/`
- Verifica que los selectores sean correctos
- Usa `--debug` para paso a paso:
  ```powershell
  npx playwright test login.spec.ts --grep "TC-LOGIN-001" --debug
  ```

---

## 🔧 Script de Discovery Automatizado

Si prefieres obtener TODOS los selectores de una vez, ejecuta este script en la consola del navegador (F12):

### Para Pantalla de Login:

```javascript
// Ejecutar en: https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx
Array.from(document.querySelectorAll('input, button, a, select, textarea'))
  .filter(e => e.offsetParent !== null) // Solo elementos visibles
  .map(e => ({
    tag: e.tagName,
    id: e.id,
    name: e.name,
    type: e.type,
    text: e.textContent?.trim().slice(0, 50),
    placeholder: e.placeholder,
  }))
```

**Copia el resultado** y busca los elementos por su `text` o `placeholder` para identificar cuál es cuál.

### Para Pantalla Post-Login (Autoreg):

```javascript
// Después de hacer login manualmente
Array.from(document.querySelectorAll('button, a, [role="button"]'))
  .filter(e => e.offsetParent !== null)
  .map(e => ({
    id: e.id,
    text: e.textContent?.trim().slice(0, 50),
    onclick: e.getAttribute('onclick'),
  }))
```

Busca el botón "Portal Distribuidor" en el resultado y copia su selector.

---

## 📚 Estrategia de Selectores (Prioridad)

Playwright recomienda usar selectores en este orden de prioridad:

1. **Por rol accesible** (más robusto):
   ```typescript
   page.getByRole('button', { name: 'Iniciar Sesión' })
   page.getByRole('textbox', { name: 'Email' })
   ```

2. **Por texto visible**:
   ```typescript
   page.locator('text=Portal Distribuidor')
   ```

3. **Por ID** (lo que usamos actualmente):
   ```typescript
   page.locator('#MainContent_btnLogin')
   ```

4. **Por CSS/XPath** (último recurso):
   ```typescript
   page.locator('input[type="email"]')
   ```

Si durante el discovery encuentras que los IDs son muy dinámicos o cambian entre ambientes, considera migrar a selectores por rol o texto visible.

---

## 🎯 Próximo Paso

Una vez actualizados los selectores de login, ejecuta la suite completa:

```powershell
npm test
```

Y revisa el reporte:

```powershell
npm run report
```

---

**Nota:** Este proceso de discovery solo se hace **una vez por pantalla**. Una vez confirmados los selectores, quedan documentados en el fixture y no necesitas repetirlo.
