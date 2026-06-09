# PetTrack OS

MVP-скелет SaaS + IoT платформы для GPS-ошейников по концепции из `PROJECT_CONCEPT.md`.

## Что внутри

- `backend/` - Django + DRF API, JWT auth, модели животных, устройств, локаций, геозон, подписок и аудита.
- `frontend/` - React + TypeScript dashboard в темной SaaS-стилистике.
- `docker-compose.yml` - PostgreSQL, Redis, backend и frontend для локального запуска.

## Быстрый запуск

```bash
docker compose -p pettrack up --build
```

После запуска:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Django admin: http://localhost:8000/admin/

## Локальный backend без Docker

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py migrate --run-syncdb
python manage.py seed_demo
python manage.py runserver
```

## Локальный frontend без Docker

```bash
cd frontend
npm install
npm run dev
```

## Главные endpoint'ы

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/me/`
- `GET/POST /api/animals/`
- `POST /api/devices/claim/`
- `GET /api/devices/`
- `GET /api/tracking/live/`
- `GET /api/tracking/animals/{id}/history/`
- `POST /api/iot/locations/`
- `GET/POST /api/geofences/`
- `GET /api/billing/plans/`
- `GET /api/admin/analytics/overview/`

## IoT payload

`POST /api/iot/locations/` принимает payload ошейника и проверяет HMAC-подпись, если у устройства задан `device_token_hash`.

```json
{
  "device_id": "COLLAR-8F2A91",
  "timestamp": "2026-06-09T12:10:25Z",
  "lat": 42.8746,
  "lng": 74.5698,
  "accuracy": 7.5,
  "speed": 1.8,
  "altitude": 765.2,
  "battery": 72,
  "signal": -83,
  "mode": "normal",
  "firmware": "1.4.2",
  "nonce": "c5b79a9e",
  "signature": "hmac_sha256..."
}
```
