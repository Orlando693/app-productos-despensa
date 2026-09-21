# Ejecución fullstack

El frontend Angular consume la API mediante `/api`. En desarrollo, Angular usa `proxy.conf.json` para reenviar esas llamadas al backend.

## Terminal 1 — backend SQLite

```bash
python backend/server.py
```

El backend usa únicamente la biblioteca estándar de Python y crea `backend/despensa.db` automáticamente.

## Terminal 2 — frontend Angular

```bash
npm install
npm start
```

Abre `http://localhost:4200`.

## API

- `GET /api/lists`
- `POST /api/lists`
- `POST /api/lists/:id/products`
- `POST /api/lists/:id/products/bulk`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/health`
