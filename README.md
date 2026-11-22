# Космический синтез — VK Play

Отдельная сборка для VK Play (GMRID 52008). Яндекс-версия живёт в репозитории `cosmic-merge` и сюда не входит.

Браузерная физическая головоломка: две одинаковые планеты сливаются в следующую. Рекламы нет. Покупки через `paymentFrame`, начисление только после `paymentReceivedCallback`. Прогресс Windows/Android пишется в облако по uid.

## Ссылки

- Игра в iframe: https://makeev095.github.io/cosmic-merge-vk/
- Кабинет: https://developers.vkplay.ru/dev/games/52008/locales/ru_RU/
- Биллинг и сейв: https://cosmic-merge-vkplay-billing.makey-studio.workers.dev/

## Локально

```sh
python3 -m http.server 8088
# http://127.0.0.1:8088/?debug
```

На localhost нет iframeApi: магазин показывает цены, оплата работает только внутри VK Play.
