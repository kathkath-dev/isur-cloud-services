# ISUR Cloud Services

App web (Node.js + Express) con base de datos MySQL, contenerizada con Docker y validada con GitHub Actions.

## Estructura

- `app/` – código de la aplicación y script `db/init.sql`
- `Dockerfile` – imagen de la app
- `docker-compose.yml` – servicios `web` y `db` (MySQL con volumen persistente)
- `.github/workflows/ci.yml` – pipeline CI

## Ejecutar

```bash
docker compose up -d --build
```

Abrir http://localhost:8090 (estado de salud: http://localhost:8090/health)
