# api-siigo

Microservicio en Node.js/Express que actúa como capa intermedia sobre la API de Siigo: se autentica contra Siigo, pagina automáticamente los resultados y expone endpoints propios más simples para consumir productos, clientes, facturas, compras, notas de crédito, recibos de caja y comprobantes contables.

## ¿Qué resuelve?

La API de Siigo pagina sus resultados (100 registros por página) y exige un token Bearer por cada request. Este servicio abstrae eso: obtiene el token, recorre todas las páginas necesarias y devuelve el listado completo en una sola respuesta JSON.

## Requisitos

- Node.js
- Credenciales de Siigo (usuario, access key y partner ID)

## Instalación

```bash
npm install
cp .env.example .env
```

Completá `.env` con tus credenciales de Siigo:

```
PORT=3000
SIIGO_USUARIO=
SIIGO_ACCESS_KEY=
SIIGO_PARTNER_ID=
```

`.env` está en `.gitignore` y nunca se commitea.

## Ejecución

```bash
node api.js
```

El servidor levanta en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Recurso de Siigo |
|---|---|---|
| GET | `/productos` | `v1/products` |
| GET | `/clientes` | `v1/customers` |
| GET | `/facturas` | `v1/invoices` |
| GET | `/compras` | `v1/purchases` |
| GET | `/notas-credito` | `v1/credit-notes` |
| GET | `/recibos-caja` | `v1/vouchers` |
| GET | `/comprobantes` | `v1/journals` |

Todos devuelven el arreglo completo de resultados ya paginado.

`/comprobantes` acepta además query params opcionales:

- `start`: fecha inicial (`YYYY-MM-DD`), por defecto `2000-01-01`
- `end`: fecha final (`YYYY-MM-DD`), por defecto la fecha actual

Ejemplo: `GET /comprobantes?start=2024-01-01&end=2024-12-31`

## Seguridad

Las credenciales de Siigo se leen desde variables de entorno (`.env`, vía `dotenv`) y nunca se commitean al repositorio.
