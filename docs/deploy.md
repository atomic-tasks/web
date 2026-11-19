# Деплой

Runbook сайта (спека 0002, ADR 0005): образ `ghcr.io/atomic-tasks/web` с nginx, отдельный compose-стек
в `/opt/atomic-tasks-web` за тем же Traefik, что и бэкенд, выкатка из GitHub Actions по тегу с подтверждением.
Файлы стека — `deploy/`. Сервер, Traefik и пользователь `deploy` уже настроены по `../backend/docs/deploy.md`.

Обозначения: `<WEB_HOST>` — сайт (например, `atomic.example.com`), `<server>` — SSH-адрес VPS.

## 1. Что должно быть до первой выкатки

- Сервер по `../backend/docs/deploy.md`, пп. 1–2: Docker с Compose v2, `curl`, `flock`, Traefik с внешней сетью,
  пользователь `deploy` в группе `docker`.
- DNS `<WEB_HOST>` → сервер (тот же пункт runbook бэкенда).
- Бэкенд выкачен с роутером `/api/` на `<WEB_HOST>` (спека 0008 бэкенда, шаг «Хосты»). Без него сайт
  открывается, но показывает «Нет связи с сервером»: `/api/` попадает в nginx и получает `503`.

## 2. Проверка образа локально

То же, что делает джоба `image` в CI:

```bash
docker build --build-arg VERSION=0.0.0-dev -t atomic-tasks-web:dev .
docker run -d --name atw --read-only --tmpfs /tmp --cap-drop ALL \
  --security-opt no-new-privileges --memory 64m -p 8080:8080 atomic-tasks-web:dev
deploy/smoke.sh http://localhost:8080 --version 0.0.0-dev
docker rm -f atw
```

В браузере `http://localhost:8080` — экран «Нет связи с сервером» (бэкенда нет), в консоли не должно быть
нарушений CSP.

## 3. Каталог и ключ CI (один раз)

Под root:

```bash
install -d -o deploy -g deploy -m 700 /opt/atomic-tasks-web
```

Ключ CI сайта — отдельный от ключа бэкенда (на ноутбуке, без пароля):

```bash
ssh-keygen -t ed25519 -N '' -C github-actions-atomic-tasks-web-deploy -f web_deploy_key
```

Публичную часть — в `~deploy/.ssh/authorized_keys` строкой из `deploy/authorized_keys.example`: ключ может
только запустить `/opt/atomic-tasks-web/deploy.sh` с версией.

## 4. Первая установка стека (под deploy)

Нужен релиз сайта (первый тег — после мёржа спеки 0002, `../guides/releases.md`). Джоба `deploy` первого
релиза упадёт, если environment ещё не настроен (п. 5), — это нормально: стек ставится руками, потом выкатка
повторяется из Actions.

```bash
cd /opt/atomic-tasks-web
V=0.1.0   # версия релиза
curl -fsSLO "https://github.com/atomic-tasks/web/releases/download/v$V/deploy.tar.gz"
tar -xzf deploy.tar.gz && rm deploy.tar.gz
curl -fsSL -o .env "https://raw.githubusercontent.com/atomic-tasks/web/v$V/deploy/.env.example"
chmod 600 .env && chmod 755 deploy.sh
```

Заполнить `.env`: `WEB_HOST` и параметры Traefik — те же, что в `/opt/atomic-tasks/.env` бэкенда. Затем:

```bash
./deploy.sh "$V"
```

Пакет `ghcr.io/atomic-tasks/web` должен быть публичным (GitHub → Packages → Package settings →
Change visibility), иначе pull упадёт с `unauthorized`.

## 5. Environment `production` в репозитории web

Так же, как у бэкенда (`../backend/docs/deploy.md`, п. 6), но в `atomic-tasks/web` и со своим ключом.
Создать **до** тега, иначе GitHub создаст environment сам — без защиты.

```bash
R=repos/atomic-tasks/web/environments/production
gh api -X PUT $R --input - <<EOF
{"wait_timer":0,"prevent_self_review":false,"can_admins_bypass":false,
 "reviewers":[{"type":"User","id":$(gh api user -q .id)}],
 "deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
EOF
gh api -X POST $R/deployment-branch-policies -f name=main -f type=branch
gh api -X POST $R/deployment-branch-policies -f name='v*' -f type=tag
```

Секреты и переменные (`known_hosts` — `ssh-keyscan -p <порт> <server>`, отпечаток сверить с сервером):

```bash
gh secret set DEPLOY_SSH_KEY --env production -R atomic-tasks/web < web_deploy_key
gh secret set DEPLOY_KNOWN_HOSTS --env production -R atomic-tasks/web < known_hosts
gh variable set DEPLOY_HOST --env production -R atomic-tasks/web --body <server>
gh variable set DEPLOY_USER --env production -R atomic-tasks/web --body deploy
gh variable set WEB_HOST --env production -R atomic-tasks/web --body <WEB_HOST>
```

`DEPLOY_PORT` — если SSH не на 22. После загрузки удалить `web_deploy_key` с ноутбука.

## 6. Выкатка

Каждый релиз: тег по `../guides/releases.md` → джоба `release` публикует образ и GitHub Release с
`deploy.tar.gz` → джоба `deploy` ждёт подтверждения → Review deployments → Approve. Джоба выкатывает версию
и проверяет снаружи `deploy/smoke.sh https://<WEB_HOST> --version X.Y.Z --behind-backend`.

## 7. Откат и повторная выкатка

```bash
gh workflow run release.yml -R atomic-tasks/web --ref main -f version=0.1.0
```

Если `deploy.sh` пишет «в релизе новая версия deploy.sh» — посмотреть дифф и заменить руками:

```bash
diff deploy.sh deploy.sh.new && mv deploy.sh.new deploy.sh && chmod 755 deploy.sh
```

## 8. Проверки после первой установки

- `deploy/smoke.sh https://<WEB_HOST> --version <V> --behind-backend` (с ноутбука, из репозитория) — зелёный.
- `curl -s -o /dev/null -w '%{http_code}\n' https://<WEB_HOST>/api/v1/me` → `401` (ответ бэкенда, не `503`).
- `curl -sI https://<WEB_HOST>/ | grep -ci strict-transport-security` — если `2`, HSTS ставит и Traefik;
  записать в «Открытые вопросы» спеки 0002.
- Память: `docker stats --no-stream atomic-tasks-web-web-1`, размер образа: `docker image ls ghcr.io/atomic-tasks/web`
  — записать в спеку 0002.
- В браузере `https://<WEB_HOST>/nope` — «Не найдено», консоль без нарушений CSP.
