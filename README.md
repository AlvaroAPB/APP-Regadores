# Regadores

App de campo para regadores: lecturas de contadores de riego y cargas de tanques de fertilizante.
Funciona sin conexión y sincroniza con la base de datos de campo (Supabase, "Campo").
Misma arquitectura que la app de monitoreo de plagas.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML, CSS y JavaScript, sin frameworks) |
| `sw.js` | Service worker: funcionamiento sin conexión |
| `manifest.json` | Instalación en el móvil como app |

## Conexión con la base de datos

Al principio del script de `index.html` (buscar `CONEXIÓN CON SUPABASE`):

```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_KEY = "sb_publishable_...";
```

- `SUPABASE_URL`: Project Settings > Data API > Project URL.
- `SUPABASE_KEY`: Project Settings > API Keys > clave pública (publishable o anon). Nunca la secreta.
- Esquemas expuestos en la Data API: `nucleo` y `fertirrigacion`.
- Sin estos datos, la app arranca en modo demostración (datos inventados).

Para cambiar de base de datos (por ejemplo, la de IT) solo hay que cambiar esas dos líneas.

## Base de datos

Scripts `MODELO_CAMPO_00` a `MODELO_CAMPO_21`, en orden. La app lee la configuración de la finca
(cabezales, contadores, tanques, productos, parcelas y polígonos) y escribe en
`fertirrigacion.lecturas_contador`, `preparaciones` y `preparaciones_lineas`.

## Uso

1. Administración (PIN), elegir la finca: su configuración se descarga y queda guardada en el móvil.
2. El regador apunta lecturas y cargas con o sin cobertura; se suben solas al volver la red.
3. Cada registro lleva un identificador generado en el móvil: los reintentos no duplican datos.

## Publicar una versión nueva

Cambiar `CACHE_VERSION` en `sw.js` y `VERSION` en `index.html`. Los móviles la cogen al abrir la app con red.

## Estado

Prototipo en piloto (Alia 1, octubre de 2026). Pendiente para producción: inicio de sesión
(Supabase Auth) con permisos por finca y persona, en sustitución del PIN y de los permisos de prototipo.
