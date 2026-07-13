# Criterios Funcionales por Componente UI

Fuente: GUÍA-QA-Historias de usuarios-Criterios funcionales v1.00, §2. Usar estos formatos al
redactar criterios de aceptación que involucren estos componentes. Los valores concretos
(mín/máx, tipos de archivo permitidos, etc.) deben acoplarse a lo que el sistema/diseño de la
historia ya establezca — los valores aquí son los recomendados/por defecto cuando la historia no
especifica algo distinto.

## Dropdown (desplegable / listado)

- Orden de listado: por defecto **alfabético**; alternativa: **Sort Order**.
- Presenta scrollbar vertical y/o horizontal dinámicamente, según el contenido.

## Date picker (selector de fecha / calendario)

### Fecha
- Formato: `dd/mmm./yyyy` (ej. `1/abr./2025`).
- Valor mínimo: recomendado (según lo establecido por el sistema).
- Valor máximo: **día actual**.

### Fechas (futuras)
Aplica a fecha de expiración de licencias, tarjetas, etc.
- Formato: `dd/mmm./yyyy` (ej. `12/nov./2025`).
- Valor mínimo: **día actual**.
- Valor máximo: recomendado (según lo establecido por el sistema).

### Fecha (rango) — Desde / Hasta
- Calendario **"Desde"**: formato `dd/mmm./yyyy` (ej. `5/mar./2025`).
  - Al escoger un valor → habilita el calendario "Hasta".
  - Al remover el valor → limpia y deshabilita "Hasta".
- Calendario **"Hasta"**: formato `dd/mmm./yyyy` (ej. `6/mar./2025`).
  - No habilitado por defecto.
  - Valor mínimo: valor de "Desde" + 1 día.

## File upload (subida de archivos)

- **Válido**: PDF **o** Docs (Word/Excel/PowerPoint) — según lo que la historia/sistema defina —
  y archivo **menor a 15 MB**.
- **No válido**: tipo de archivo no permitido (ej. imágenes si el sistema solo acepta PDF/Docs) o
  archivo **mayor a 15 MB**.

## Table (tablas)

- Orden de listado: por defecto **fecha**; alternativa: **número/ID**.
- Al exceder 20 registros:
  - Sección "Mostrando" (abajo-izquierda): formato `Mostrando 1 al 20 de ### resultados`.
  - Sección "Paginación" (abajo-derecha), agrupación de 20 registros:
    - Página inicial: botones `1) Numeración, 2) Próxima, 3) Final`.
    - Página 2 en adelante: botones `1) Anterior, 2) Numeración, 3) Próxima, 4) Final`.
    - Página final: botones `1) Inicial, 2) Anterior, 3) Numeración`.
- Scrollbar vertical y/o horizontal dinámicamente, según el contenido.

## Text field (campo de texto)

| Campo | Formato | Ejemplo | Válido | No válido |
|---|---|---|---|---|
| Código Postal (parcial) | `#####` | `00926` | Solo dígitos numéricos | Letras, caracteres especiales, espacios, menos de 5 dígitos |
| Código Postal (completo) | `#####-####` | `00926-5433` | Solo dígitos numéricos | Letras, caracteres especiales, espacios, menos de 9 dígitos |
| Comentarios | Contador `0 de 3,000` (según sistema) | — | Alfanumérico + caracteres especiales + espacios; muestra scrollbar al exceder el espacio visible | Más de 3,000 caracteres |
| Email | `nombre@email.com` | `fcalderon@insyspr.com` | Alfanumérico + `@` y `.` | Caracteres especiales (excepto `@`/`.`), espacios |
| Numérico — Dinero | `0,###,###.00` | `42,988.00` | Dígitos numéricos + punto | Letras, caracteres especiales, espacios |
| Numérico — Decimal | `0#,###.00` | `2,654.73` | Dígitos numéricos + punto | Letras, caracteres especiales, espacios |
| Numérico — Entero positivo | `0,###` | `9,876` | Dígitos numéricos | Letras, caracteres especiales, espacios, signo negativo |
| Numérico — Entero negativo | `-0,###` | `-9,876` | Dígitos numéricos + carácter negativo | Letras, caracteres especiales, espacios |
| Numérico — Entero (positivo y negativo) | `0,###` / `-0,###` | `9,876` / `-9,876` | Dígitos numéricos + carácter negativo | Letras, caracteres especiales, espacios |
| Seguro Social | `***-**-####` | `***-**-4325` | Solo dígitos numéricos | Letras, caracteres especiales, espacios, menos de 9 dígitos |
| Teléfono | `(###) ###-####` | `(123) 123-1234` | Solo dígitos numéricos | Letras, caracteres especiales, espacios, menos de 10 dígitos |

## Ortografía y gramática

Para clasificar una incorrección ortográfica/gramatical, comparar la **Historia**, el **Diseño
visual** y los **Datos** contra lo desarrollado:

| # | Historia | Diseño visual | Datos | Desarrollo coincide con | ¿Válido? | Tipo de desviación | Actualizar |
|---|---|---|---|---|---|---|---|
| 1 | Correcta | Correcta | — | Historia y Diseño | Sí | — | — |
| 2 | Correcta | Correcta | Incorrecta | Historia y Diseño | No | Mejora | Datos |
| 3 | Incorrecta | Incorrecta | — | Historia y Diseño | No | Mejora | Historia y Diseño |
| 4 | Correcta | Incorrecta | — | Historia | Sí | — | Diseño |
| 5 | Correcta | Incorrecta | — | Diseño | No | Bug | Diseño |
| 6 | Incorrecta | Correcta | — | Historia | No | Mejora | Historia |
| 7 | Incorrecta | Correcta | — | Diseño | Sí | — | Historia |

> En resumen: si el desarrollo sigue lo que dice la **Historia/Diseño correctos** → válido. Si el
> desarrollo sigue una fuente **incorrecta** existiendo otra correcta disponible → **Bug**
> (corregir el desarrollo). Si todas las fuentes relevantes están mal pero el desarrollo las
> refleja fielmente → **Mejora** (corregir la(s) fuente(s), no el desarrollo).
