# autoservice-app

## Frontend

### Локальный запуск frontend отдельно
```bash
cd frontend
npm install
npm run dev
```

Доступно по URL:
- `http://localhost:5173`

Переменные окружения frontend:
- `frontend/.env`
- `VITE_API_URL=http://localhost:3000`

## Запуск через Docker Compose
Из корня проекта:
```bash
docker compose up --build
```

После запуска доступны:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Telegram Integration

### Как получить токен у BotFather
1. Откройте Telegram и найдите `@BotFather`.
2. Выполните команду `/newbot`.
3. Укажите имя и username бота.
4. Скопируйте выданный токен и сохраните в `backend/.env` как `TELEGRAM_BOT_TOKEN`.
5. В `backend/.env` задайте `PUBLIC_BOT_USERNAME` без символа `@`.

### Как выставить webhook на localhost через ngrok
1. Запустите backend на `http://localhost:3000`.
2. Поднимите туннель:
```bash
ngrok http 3000
```
3. Возьмите HTTPS URL от ngrok, например `https://abcd-12-34-56-78.ngrok-free.app`.
4. Установите webhook:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://abcd-12-34-56-78.ngrok-free.app/telegram/webhook"
```

### Как протестировать link flow
1. Создайте клиента через `POST /clients`.
2. Получите ссылку привязки через `GET /clients/:id/tg-link`.
3. Откройте ссылку вида `https://t.me/<PUBLIC_BOT_USERNAME>?start=link_<token>`.
4. В Telegram отправится команда `/start link_<token>`.
5. Backend обработает webhook, свяжет клиента (`telegramUserId`, `tgLinkedAt`) и отправит подтверждение.

### Полезные endpoint-ы
- `POST /clients/:id/tg-refresh-token` — обновляет токен и возвращает новую ссылку.
- `GET /clients/:id/tg-link` — возвращает текущую ссылку привязки.
- `POST /telegram/webhook` — endpoint для update-ов Telegram.

### Режим polling (без ngrok/webhook)
1. В `backend/.env` укажите:
```env
TELEGRAM_MODE=polling
TELEGRAM_POLL_INTERVAL_MS=1500
```
2. Перезапустите backend.
3. В этом режиме Telegram update-ы читаются через `getUpdates`, поэтому `ngrok` и публичный webhook не требуются.
