# Deployment

Инструкция рассчитана на VPS с `nginx` и доменом `geometry.oipav.ru`.

## 1. Локальная подготовка

Убедиться, что сайт открывается локально:

```bash
cd /Users/evilfaust/Documents/APP/geometry
python3 -m http.server 4173
```

## 2. Подготовить каталог на сервере

На VPS:

```bash
mkdir -p /var/www/geometry
```

## 3. Залить файлы на сервер

Пример с `rsync`:

```bash
rsync -av --delete \
  /Users/evilfaust/Documents/APP/geometry/ \
  root@147.45.158.148:/var/www/geometry/
```

Если не нужен перенос служебных файлов, можно исключить `.git`:

```bash
rsync -av --delete \
  --exclude ".git" \
  /Users/evilfaust/Documents/APP/geometry/ \
  root@147.45.158.148:/var/www/geometry/
```

## 4. Установить конфигурацию nginx

В репозитории лежит готовый шаблон:

`nginx/geometry.oipav.ru.conf`

Его нужно скопировать на сервер:

```bash
scp /Users/evilfaust/Documents/APP/geometry/nginx/geometry.oipav.ru.conf \
  root@147.45.158.148:/etc/nginx/sites-available/geometry.oipav.ru.conf
```

Дальше на сервере:

```bash
ln -sf /etc/nginx/sites-available/geometry.oipav.ru.conf /etc/nginx/sites-enabled/geometry.oipav.ru.conf
nginx -t
systemctl reload nginx
```

## 5. Проверить DNS

Домен `geometry.oipav.ru` должен указывать на IP:

```text
147.45.158.148
```

Пока DNS не обновился, сайт можно проверять по IP или через локальный `curl` с заголовком `Host`.

## 6. Проверить сайт после выкладки

Примеры проверок:

```bash
curl -I https://geometry.oipav.ru
curl -I https://geometry.oipav.ru/triangle-presentation/
curl -I https://geometry.oipav.ru/hexagon-presentation/
curl -I https://geometry.oipav.ru/pentagon-presentation/
curl -I https://geometry.oipav.ru/egg-presentation/
```

## 7. Подключить HTTPS

После того как DNS начнет резолвиться на VPS:

```bash
apt-get update
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d geometry.oipav.ru
```

## 8. Обновление сайта в будущем

При следующем обновлении достаточно:

1. Изменить файлы локально.
2. Проверить сайт локально через `python3 -m http.server 4173`.
3. Залить проект на сервер через `rsync`.
4. Если менялась конфигурация `nginx`, выполнить:

```bash
nginx -t
systemctl reload nginx
```

Если конфигурация `nginx` не менялась, после `rsync` достаточно проверить, что главная и нужные страницы открываются по `https://geometry.oipav.ru`.
