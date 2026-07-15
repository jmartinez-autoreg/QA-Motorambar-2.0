# Automated Testing - Portal Motorambar

Pruebas E2E automatizadas con Playwright para el Portal de Distribución de Vehículos Motorambar.

## 📋 Estructura del Proyecto

```
Automated-Testing/
├── tests/              # Test specs (.spec.ts)
├── fixtures/           # Page Objects y datos de test
│   └── files/          # Archivos de test (PDFs, Excel, etc.)
├── helpers/            # Funciones auxiliares
├── data/               # Datos de test (JSON, CSV)
├── playwright.config.ts
├── .env.playwright     # Variables de ambiente (NO subir a repo)
└── package.json
```

## 🚀 Instalación

```powershell
# 1. Instalar dependencias
npm install

# 2. Instalar navegadores de Playwright
npx playwright install chromium

# 3. Configurar variables de ambiente
# Crear .env.playwright con las credenciales de test
```

## ▶️ Ejecución de Tests

```powershell
# Ejecutar todos los tests (modo headed - visible)
npm test

# Ejecutar en modo lento (800ms entre acciones)
npm run test:slow

# Ejecutar en modo debug (con Playwright Inspector)
npm run test:debug

# Ejecutar en modo headless (sin UI)
npm run test:headless

# Ejecutar UI mode (interfaz interactiva)
npm run ui

# Ver reporte HTML de la última ejecución
npm run report
```

## 🧪 Tests Disponibles

### Login (login.spec.ts)
- ✅ TC-LOGIN-001: Login exitoso con credenciales válidas
- ✅ TC-LOGIN-002: Login fallido con credenciales inválidas
- ✅ TC-LOGIN-003: Validación de campos requeridos vacíos
- ✅ TC-LOGIN-004: Checkbox "Recuérdame" funcional
- ✅ TC-LOGIN-005: Link "¿Olvidaste tu contraseña?" funcional
- ✅ TC-LOGIN-006: Logout desde Autoreg post-login
- ✅ TC-LOGIN-SEC-001: Seguridad - Inyección SQL
- ✅ TC-LOGIN-SEC-002: Seguridad - XSS
- ✅ TC-LOGIN-EDGE-001: Edge case - Email con espacios

## 🔧 Configuración

### Variables de Ambiente (.env.playwright)

```env
BASE_URL=https://testwaf.portaldevehiculos.com
PORTAL_DISTRIBUIDOR_URL=https://motorambartest.portaldevehiculos.com
TEST_USER_DISTRIBUIDOR=j.motorambar
TEST_PASS_DISTRIBUIDOR=123456
SLOW_MO=0
HEADLESS=false
```

## 📝 Convenciones

### Nomenclatura de Tests
- **TC-[MODULO]-[NUM]**: Test cases funcionales
- **TC-[MODULO]-SEC-[NUM]**: Tests de seguridad
- **TC-[MODULO]-EDGE-[NUM]**: Tests de casos edge

### Estructura de un Test
```typescript
test('TC-XXX-001: Descripción del caso de prueba', async ({ page }) => {
  // PASO 1: Acción
  // RESULTADO ESPERADO 1: Verificación
  // PASO 2: Acción
  // RESULTADO ESPERADO 2: Verificación
  // ...
});
```

## 🎯 Próximos Tests a Implementar

- [ ] Vehículos Importados - Grid y Filtros
- [ ] Importar Vehículos - Flujo completo
- [ ] Importar CPA - Flujo completo
- [ ] Editar/Ver Vehículo
- [ ] Generación de Reportes
- [ ] Administración (solo SysAdmin)

## 🐛 Debug y Troubleshooting

### Ver trace de un test fallido
```powershell
npx playwright show-trace test-results/[nombre-test]/trace.zip
```

### Generar código con Codegen
```powershell
npx playwright codegen --viewport-size=1280,720 https://testwaf.portaldevehiculos.com
```

### Ejecutar un solo test
```powershell
npx playwright test login.spec.ts
```

### Ejecutar tests que coincidan con un patrón
```powershell
npx playwright test --grep "LOGIN-001"
```

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- Context: `../context/CONTEXT.md` y `../context/UI-UX.md`
- Skills: `../skills/playwright-e2e/SKILL.md`

---

**Mantenido por:** QA Team Motorambar  
**Última actualización:** 2026-07-15
