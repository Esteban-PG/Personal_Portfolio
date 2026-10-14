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

## Seguridad

- Sin sesión válida, el servidor solo manda el formulario de la clave: ni el HTML ni el payload RSC
  traen datos. La URL y la clave del script nunca llegan al navegador.
- Sesión: cookie httpOnly + Secure + SameSite=strict, firmada con HMAC y con vencimiento (30 días).
- Con Upstash Redis (el mismo de /running): 8 claves incorrectas por IP cada 15 minutos, y si hay
  40 incorrectas en una hora sumando todas las IP, el inicio de sesión se cierra para todos esa hora
  (las sesiones abiertas siguen funcionando). Cada intento fallido además espera 1 segundo.
- Avisos por correo (los envía el Apps Script desde tu Gmail, `accion: "aviso-acceso"`): cada
  inicio de sesión, cuando una IP agota sus intentos, y cuando se cierra el inicio de sesión.
- Encabezados: noindex, no-store, sin iframes (X-Frame-Options / frame-ancestors), nosniff.
- ¿Alguien entró sin ser tú? Cambia `FINANZAS_PASSWORD` y `FINANZAS_SESSION_SECRET` en Vercel y
  vuelve a desplegar: eso cierra la sesión en todos los dispositivos.

## Archivos

- `app/finanzas/page.js` — revisa la sesión; muestra el login o el dashboard.
- `app/api/finanzas/login`, `logout` — crean y borran la cookie de sesión (httpOnly, 30 días).
- `lib/finanzas-auth.js` — clave, firma de la sesión y límite de intentos.
- `lib/finanzas.js` — pide el resumen al script (solo desde el servidor, caché de 60 s).
- `components/FinanzasLogin.js`, `components/FinanzasDashboard.js` — interfaz.
- Estilos: sección `/finanzas` al final de `app/globals.css` (clases `fz-*`).
- `next.config.mjs` — encabezados `noindex` y `no-store` para /finanzas.

La página no está enlazada en el sitio, no aparece en el sitemap y no se indexa.

## Pagos fijos del mes

El resumen del script trae `fijos`: un elemento por gasto fijo vigente con `pagos`, `veces`,
`pagado` y `estado` (`pagado` / `parcial` / `pendiente`). La página lo muestra en todas las vistas,
justo debajo de "Te queda" y destacado en ámbar (`PagosFijos` en `components/FinanzasDashboard.js`). La configuración vive en la pestaña
**Fijos** del Sheet (palabras clave separadas por coma y "Pagos por mes", p. ej. limpieza = 4).

## Deberías tener hoy

El resumen trae `saldo`: ahorro inicial + quincenas ya pagadas (12 y 26, o el viernes antes si caen
en fin de semana) + ingresos extra − todo lo gastado (variable, fijos y extraordinarios), contando
desde "Contar desde" en la pestaña **Ahorro**. Se muestra en todas las vistas (`SaldoEsperado`).
Incluye compras con tarjeta aunque no se haya pagado la tarjeta: compáralo con cuentas − deuda de tarjeta.

## Cuenta regresiva al próximo pago

`CuentaRegresiva` calcula el próximo pago en el navegador (no depende del script): 12 y 26, o el
viernes antes si cae en fin de semana, a las 6:00 p. m. hora de Costa Rica. No toma en cuenta feriados.
Si el resumen trae `saldo.proximoPago.monto`, muestra el monto.
