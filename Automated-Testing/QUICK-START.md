# 🚀 Quick Start - Automatización Playwright

## Instalación Completada ✅

La estructura de Playwright ya está lista. Estos son los próximos pasos:

---

## 📋 Paso 1: Verificar Selectores Reales

Los selectores en `fixtures/login.fixture.ts` son **estimaciones**. Antes de ejecutar los tests, verifica los IDs reales:

```powershell
# Navegar a la carpeta de automatización
cd Automated-Testing

# Abrir Playwright Codegen para descubrir selectores
npx playwright codegen --viewport-size=1280,720 https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx
```

**Qué hacer:**
1. En el navegador que se abre, haz click en cada elemento del formulario
2. Copia los selectores que aparecen en el Inspector (panel derecho)
3. Actualiza `fixtures/login.fixture.ts` con los selectores reales

📖 **Guía detallada:** Ver `DISCOVERY.md`

---

## ▶️ Paso 2: Ejecutar Tests de Login

```powershell
# Ejecutar todos los tests de login
npm test

# O ejecutar en modo lento (para ver cada paso)
npm run test:slow

# O ejecutar solo un test específico
npx playwright test --grep "TC-LOGIN-001" --headed
```

---

## 📊 Paso 3: Ver Resultados

```powershell
# Ver reporte HTML
npm run report
```

Los screenshots de fallos quedan en: `test-results/`

---

## 🐛 Troubleshooting

### Si un test falla:

1. **Verificar selectores:**
   ```powershell
   # Ejecutar en modo debug (paso a paso)
   npm run test:debug
   ```

2. **Ver trace de la ejecución:**
   ```powershell
   npx playwright show-trace test-results/[nombre-carpeta]/trace.zip
   ```

3. **Ver screenshot del fallo:**
   - Los screenshots se guardan automáticamente en `test-results/`

### Si los selectores no funcionan:

- Ejecuta el script de discovery en `DISCOVERY.md`
- Actualiza los selectores en `fixtures/login.fixture.ts`
- Vuelve a ejecutar el test

---

## 🎯 Próximos Tests a Implementar

Una vez que el login esté funcionando, los siguientes módulos son:

1. **Vehículos Importados** - Grid, filtros, acciones batch
2. **Importar Vehículos** - Carga de archivo Excel/CSV
3. **Importar CPA** - Flujo multi-step
4. **Editar/Ver Vehículo** - CRUD de vehículos
5. **Reportes** - Generación desde Dashboard

---

## 📁 Estructura del Proyecto

```
Automated-Testing/
├── tests/
│   └── login.spec.ts          ← 9 test cases de login
├── fixtures/
│   ├── login.fixture.ts       ← Selectores y datos
│   └── files/
│       └── dummy.pdf          ← Archivo de prueba
├── helpers/
│   ├── wait-helpers.ts        ← Funciones de espera
│   └── auth-helpers.ts        ← Helpers de autenticación
├── playwright.config.ts       ← Configuración principal
├── .env.playwright           ← Credenciales (NO subir a repo)
└── README.md                  ← Documentación completa
```

---

## 🔑 Credenciales Configuradas

```
Usuario: j.motorambar
Contraseña: 123456
```

Estas están en `.env.playwright` (gitignored).

---

## 📚 Recursos

- **Documentación completa:** `README.md`
- **Guía de discovery:** `DISCOVERY.md`
- **Skill de Playwright E2E:** `../skills/playwright-e2e/SKILL.md`
- **Contexto del proyecto:** `../context/CONTEXT.md`
- **Pantallas documentadas:** `../context/UI-UX.md`

---

## ✅ Checklist de Primer Uso

- [ ] Ejecutar `npx playwright codegen` y verificar selectores
- [ ] Actualizar `fixtures/login.fixture.ts` con IDs reales
- [ ] Ejecutar `npm test` y verificar que pasan todos los tests
- [ ] Revisar screenshots en `test-results/` si algo falla
- [ ] Ver reporte HTML con `npm run report`

---

**¡Listo para comenzar! 🎉**

Ejecuta `npm test` cuando hayas verificado los selectores.
