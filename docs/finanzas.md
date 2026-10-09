# /finanzas — dashboard privado de gastos

Página privada (con clave) que muestra el resumen de gastos que calcula el
Google Apps Script "Gastos BAC". El Sheet y el script siguen siendo el motor;
esta página solo **lee**.

```
BAC → Gmail → Apps Script (cada minuto) → Google Sheet
                                   ↓  POST { accion: "resumen", clave }   (servidor → servidor)
               app/finanzas/page.js  → lib/finanzas.js (caché 60 s) → componentes
```

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Qué es |
| --- | --- |
| `FINANZAS_PASSWORD` | La clave para entrar a /finanzas. |
| `FINANZAS_SESSION_SECRET` | Texto largo aleatorio para firmar la sesión. Cambiarlo cierra la sesión en todos los dispositivos. |
| `FINANZAS_SCRIPT_URL` | URL de la aplicación web del Apps Script (termina en `/exec`). |
| `FINANZAS_SCRIPT_KEY` | Clave de **solo lectura** del script (en Apps Script: ejecutar `verClaveLectura`). |

Ninguna de estas va en el repo (es público). Después de agregarlas o cambiarlas, hay que volver a desplegar.

Opcional: si el proyecto tiene Upstash Redis (el mismo de /running), se limita a 8 intentos
de clave incorrectos por IP cada 15 minutos. Sin Redis, cada intento fallido igual espera 1 segundo.

## Archivos

- `app/finanzas/page.js` — revisa la sesión; muestra el login o el dashboard.
- `app/api/finanzas/login`, `logout` — crean y borran la cookie de sesión (httpOnly, 30 días).
- `lib/finanzas-auth.js` — clave, firma de la sesión y límite de intentos.
- `lib/finanzas.js` — pide el resumen al script (solo desde el servidor, caché de 60 s).
- `components/FinanzasLogin.js`, `components/FinanzasDashboard.js` — interfaz.
- Estilos: sección `/finanzas` al final de `app/globals.css` (clases `fz-*`).
- `next.config.mjs` — encabezados `noindex` y `no-store` para /finanzas.

La página no está enlazada en el sitio, no aparece en el sitemap y no se indexa.
