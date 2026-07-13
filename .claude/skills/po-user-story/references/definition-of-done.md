# Definition of Done (DoD)

Fuente: GUÍA-QA-Historias de usuarios-Definition of Done v1.00, §3. Una historia se considera
**Done** (lista para `Closed`) cuando se cumplen los 7 ítems siguientes. La etiqueta entre
corchetes indica el rol responsable de aprobar ese ítem.

1. Código cumple con los estándares de programación `[DEV]` (ref: Manual de Estándares de
   Programación).
2. Criterios funcionales realizados y aprobados `[DEV]` (ref:
   `references/criterios-funcionales-ui.md` / GUÍA-QA-Historias de usuarios-Criterios
   funcionales).
3. Unit Testing (pruebas unitarias) realizadas y aprobadas `[DEV]`.
4. Code Review (revisión de código) realizado y aprobado `[TL]`.
5. Quality Assurance (QA) realizado y aprobado `[QAA]` (ref: PROC-QA-Generales de calidad).
6. Desviaciones de QA resueltas y aprobadas `[QAA]` (ref: PROC-QA-Generales de calidad).
7. Requerimientos y funcionalidades realizados y aprobados `[PO]`.

> Para QA, el ítem 5 y 6 se cumplen cuando la US pasa a `Closed` con comentario `QA PASSED` (ver
> `agents/QA-PRO.agent.md` §5 "Documentación de US post-ejecución").
