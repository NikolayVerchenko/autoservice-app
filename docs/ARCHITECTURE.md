# ARCHITECTURE

## Контекст
Backend построен на NestJS + TypeORM + PostgreSQL. Модули:
- `UserModule`
- `ClientModule`
- `CarModule`
- `DefectModule`
- `OrderModule`
- `AppointmentModule`
- `TelegramModule`

## Сущности

### User
- `id: uuid`
- `role: enum` (`RECEPTION`, `MECHANIC`, `PARTS`)
- `name: string`
- `login: string` (unique)
- `passwordHash: string`
- `telegramUserId: string | null`
- `createdAt`, `updatedAt`

### Client
- `id: uuid`
- `name: string`
- `phone: string`
- `telegramUserId: string | null`
- `tgInviteToken: string | null`
- `tgLinkedAt: timestamp | null`
- `createdAt`, `updatedAt`

### Car
- `id: uuid`
- `clientId: uuid`
- `brand: string`
- `model: string`
- `year: int | null`
- `vin: string | null`
- `plate: string | null`
- `mileage: int | null`
- `createdAt`, `updatedAt`

### Defect
- `id: uuid`
- `number: string` (`ДФ-YYYY-000001`)
- `clientId: uuid`
- `carId: uuid`
- `createdByUserId: uuid | null`
- `assignedMechanicId: uuid | null`
- `status: enum`
- `plannedVisitDate: date | null`
- `publicShareToken: string | null`
- `createdAt`, `updatedAt`

### DefectComplaint
- `id: uuid`
- `defectId: uuid`
- `idx: int`
- `complaintText: string`
- `diagnosticText: string | null`
- `diagnosticStatus: enum` (`NEED_REPLY`, `REPLIED`)
- `approvalStatus: enum` (`PENDING`, `ORDER`, `RECOMMENDATION`)
- `createdAt`, `updatedAt`

### ComplaintLabor
- `id: uuid`
- `complaintId: uuid`
- `name: string`
- `qty: int` (>=1)
- `priceRub: int` (>=0)
- `createdAt`, `updatedAt`

### ComplaintPart
- `id: uuid`
- `complaintId: uuid`
- `name: string`
- `qty: int` (>=1)
- `priceRub: int` (>=0)
- `fromStock: boolean` (default `false`)
- `createdAt`, `updatedAt`

### Order
- `id: uuid`
- `number: string` (`ЗН-YYYY-000001`)
- `defectId: uuid` (FK, unique)
- `status: enum` (`OPEN`, `IN_WORK`, `DONE`, `CLOSED`)
- `createdAt`, `updatedAt`

### OrderWork
- `id: uuid`
- `orderId: uuid`
- `sourceComplaintId: uuid | null`
- `name: string`
- `qty: int`
- `priceRub: int`
- `createdAt`, `updatedAt`

### OrderPart
- `id: uuid`
- `orderId: uuid`
- `sourceComplaintId: uuid | null`
- `name: string`
- `qty: int`
- `priceRub: int`
- `fromStock: boolean`
- `createdAt`, `updatedAt`

### OrderRecommendation
- `id: uuid`
- `orderId: uuid`
- `sourceComplaintId: uuid | null`
- `text: string`
- `estTotalRub: int | null`
- `createdAt`, `updatedAt`

### Appointment
- `id: uuid`
- `clientId: uuid` (FK -> `Client.id`)
- `carId: uuid` (FK -> `Car.id`)
- `defectId: uuid | null` (FK -> `Defect.id`)
- `startAt: timestamp`
- `endAt: timestamp`
- `status: enum` (`PLANNED`, `CONFIRMED`, `ARRIVED`, `CANCELED`, `DONE`)
- `comment: string | null`
- `createdAt`, `updatedAt`

Связи:
- `Appointment N -> 1 Client`
- `Appointment N -> 1 Car`
- `Appointment N -> 0..1 Defect`

Правило пересечений времени при создании записи:
- запрет пересечения с существующей записью по условию
`startAt < existing.endAt AND endAt > existing.startAt`
- при пересечении API возвращает `400` и сообщение `Time slot already occupied`.

### Counter
- `key: string`
- `year: int`
- `lastValue: int`

Для дефектовок используется `key='defect_number'`, для заказ-нарядов `key='ORDER'`.

### TelegramSession
- `id: uuid`
- `userId: uuid`
- `activeDefectId: uuid | null`
- `activeComplaintId: uuid | null`
- `state: enum` (`IDLE`, `CHOOSING_COMPLAINT`, `ENTERING_DIAGNOSIS_TEXT`)
- `updatedAt`

## Деньги
- Все цены: `int` в рублях (`priceRub`).
- Копейки не используются.

## Итоги
Для каждой жалобы:
- `laborTotalRub = Σ(labor.qty * labor.priceRub)`
- `partsTotalRub = Σ(part.qty * part.priceRub)`
- `totalRub = laborTotalRub + partsTotalRub`

Для дефектовки:
- `laborTotalRub = Σ complaint.laborTotalRub`
- `partsTotalRub = Σ complaint.partsTotalRub`
- `totalRub = laborTotalRub + partsTotalRub`

## Правила Переноса В Заказ-Наряд
`POST /defects/:id/create-order`:
1. Проверяется, что у дефектовки еще нет `Order`.
2. Генерируется номер `ЗН-YYYY-000001` через `counters` (`key='ORDER'`) в транзакции.
3. По жалобам с `approvalStatus=ORDER`:
- `ComplaintLabor -> OrderWork`
- `ComplaintPart -> OrderPart`
4. По жалобам с `approvalStatus=RECOMMENDATION`:
- создается `OrderRecommendation`
- `text = complaintText + " / " + diagnosticText` (если `diagnosticText` заполнен)
- `estTotalRub = totalRub` по жалобе
5. `defect.status` переводится в `ORDER_CREATED`.

## Отправка Дефектовки Клиенту
`POST /defects/:id/send-to-client`:
1. Загружается дефектовка с клиентом, автомобилем, жалобами и итогами.
2. Проверяется, что `client.telegramUserId` заполнен.
- если нет, возвращается `400` с сообщением `Client is not linked to Telegram`.
3. Если `publicShareToken` пустой, генерируется UUID и сохраняется в `Defect`.
4. Формируется сообщение клиенту с номером, авто, количеством жалоб, суммой и публичной ссылкой:
`<PUBLIC_APP_URL>/public/defects/<id>?token=<publicShareToken>`
5. Отправка выполняется через `TelegramService.sendMessage`.

## Публичная Дефектовка
`GET /public/defects/:id?token=...`:
1. Дефектовка ищется по `id`.
2. Если `defect.publicShareToken` пустой, возвращается `404`.
3. Если query `token` не совпадает с `defect.publicShareToken`, возвращается `403`.
4. При валидном токене возвращается HTML (`text/html`) с клиентом, авто, жалобами, работами/запчастями, статусами и итогами.

## API (текущий срез)
- `POST /users`
- `GET /users?role=MECHANIC`
- `GET /users/:id`
- `POST /clients`
- `GET /clients`
- `GET /clients/:id`
- `POST /cars`
- `GET /cars?clientId=<uuid>`
- `GET /cars/:id`
- `POST /defects`
- `GET /defects`
- `GET /defects/:id`
- `POST /defects/:id/complaints`
- `PATCH /complaints/:id`
- `PATCH /complaints/:id/approval`
- `POST /complaints/:id/labors`
- `PATCH /complaint-labors/:id`
- `DELETE /complaint-labors/:id`
- `POST /complaints/:id/parts`
- `PATCH /complaint-parts/:id`
- `DELETE /complaint-parts/:id`
- `POST /defects/:id/assign-mechanic`
- `POST /defects/:id/send-to-client`
- `POST /defects/:id/create-order`
- `GET /orders/:id`
- `GET /orders?defectId=<uuid>`
- `POST /appointments`
- `GET /appointments`
- `GET /appointments/:id`
- `PATCH /appointments/:id/status`
- `POST /telegram/webhook`
- `GET /public/defects/:id?token=...`
