# visualize-change

A toolkit to visualize changes in OSM, part of the OSM Analytics ecosystem. Work in Progress.

## structure

- `api` - api code (node + mongodb)
- `docker` - docker related files / configs and shared data volumes
- `frontend` - frontend code
- `server` - `nginx` config (`nginx` binds frontend and api together and exposes port `8080` in dev, and `80` in production)
- `scripts` - common scripts
- `renderer` - electron based offline renderer (gif & mp4)
- `tile-processor` - crontab and script that download and processes earth QA tiles daily, runs only in production environment

## env

Some keys are required for app to work properly:

```
MAILGUN_API_KEY=...     # api key for mailgun
MAILGUN_DOMAIN=...      # domain from mailgun
MAPBOX_ACCESS_TOKEN=... # access token for mapbox
SERVER_DOMAIN=...       # main domain of the server (http://SERVER_DOMAIN/), used for making URL in email
POSTGRES_PASSWORD=...   # password to be used for postgres DB
POSTGRES_USER=...       # user to be used for postgres DB
```

For dev, this could be set in `PROJECT_ROOT/.env`, for production use it's preffered to `export` them in the shell.

## dev setup

1. `yarn install`
2. `./scripts/setup-docker-data-folders.sh`
3. `./scripts/get-indonesia-tiles.sh` (test tiles for `dev`, final application will use tiles for the whole earth)
4. optionally generated underzoom for tiles (this takes a while) `./scripts/tiles-add-underzoom.sh`
5. `yarn run build:dev` or `./scripts/build.dev.sh`

## dev run

1. `yarn run start:dev` or `./scripts/start.dev.sh`
2. `open http://localhost:8080`

## prod setup

1. `./scripts/get-indonesia-tiles.sh` (test tiles for now) OR `./scripts/get-earth-tiles.sh` (whole earth if you have the hard drive space)
2. `./scripts/setup-docker-data-folders.sh`
3. optionally generated underzoom for tiles (this takes a while) `./scripts/tiles-add-underzoom.sh`
4. `yarn run build:prod` or `./scripts/build.prod.sh`

## prod run

1. `yarn run start:prod` or `./scripts/start.prod.sh`
2. `open http://localhost:8080`

## dev workflow

Each app should crash on error, and will be picked up by `docker` and restarted.

On start each app first installs missing deps (`yarn install`).

All dockerized apps shadow `node_modules` folder to avoid native code issues (for example Electron installed on macOS wont run in docker).

All dockerized apps in dev mode run file watcher on `package.json` and re-install (`yarn install`) deps on changes to that file, in addition to running file watchers that should restart the dockerized app.

## offline renderer notes

Exported `mp4` are stored in `./docker/data/capture` (a docker data volume).

Export flow is as follows:

1. user selected date span, lat & lng coordinates, and provides email for notification when render is finished
2. render button triggers `/api/render` endpoint, which queues RabbitMQ message for renderer
3. renderer picks up the message, spawns headless electron, and renders frame by frame
4. after all frames are renderer, renderer spawns ffmpeg process to create mp4 file (files are stored in `./docker/data/capture`)
5. finally, server is notified back through RabbitMQ, where email is sent to the user

Renderer can be tested on host machine, so the Electron window is visible, to run: `yarn run test:local-render` providing proper rendering config as JSON, for example:

```sh
$ MAPBOX_ACCESS_TOKEN=... yarn run test:local-render '$STRINGIFIED_RENDER_CONFIG'
```

Where `$STRINGIFIED_RENDER_CONFIG` should conform to api render config validation.

