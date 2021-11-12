# Goroxels
## Что? Куда я попал?
Это репозиторий лучших пикселей, когда-либо деланных - горокселей!!
Почти всё слизано у других сайтов, и оставлено только лучшее - по мнению гороха!
## Я просто спросить
В любом случае, тебе понадобится установить [node.js](https://nodejs.org/en/), лучше LTS.
Скачай этот реп, выполни в папке с ним (на винде shift+пкм на свободном месте в папке - "запустить PowerShell(или cmd)"), `npm install`, а затем `npm start`, и всё! 
Гороксели будут доступны по http://localhost:8000
## Хочу перемен
### Требования:
- [Node.js](https://nodejs.org/en/) с NPM
- [pm2](https://github.com/Unitech/pm2) (`npm install pm2 -g`) (опционально, но текущая инструкция без него не будет работать)
- [Mysql](https://www.mysql.com/downloads/) (опционально)


Чтобы полноценно и удобно разрабатывать гороксели, нужно чтобы папки с обоими репозиториями находились в одной общей. Имена папок должны быть *goroxels-server* и *goroxels-client*:

```
git clone https://github.com/TheGorox/goroxels-server.git ./goroxels-server
git clone https://github.com/TheGorox/goroxels-client.git ./goroxels-client
```

После скачивания, создай файл *sharedConfig.json* в общей папке и скопируй туда содержимое с *goroxels-server*/shared/config.json. Это упростит в будущем копирование конфига в клиент и в сервер:
```
cp ./goroxels-server/shared/config.json sharedConfig.json
```

Выполни `npm install` в обеих папках:
```
npm install --prefix goroxels-server
npm install --prefix goroxels-client
```

Клиент компилируется командой `npm run devBuild` в папке с клиентом.

Для того, чтобы в два клика компилировать клиент и перезапускать сервер, создай батник с именем, которое нравится(к примеру, start.bat) в общей папке и вставь туда 
```
npm run devBuild --prefix goroxels-client && ^
cd goroxels-server && ^
pm2 startOrRestart ecosystem.config.js --update-env && ^
cd .. && ^
pm2 logs goroxels
```

Теперь можно запускать это дело двойным кликом или `.\start.bat` из консоли.
На линусе этот батник, скорее всего, не сработает, но красноглазые достаточно умны чтобы самим разобраться.
Запускать научились. Теперь взглянем на эти прекрасные переменные окружения.
Ниже приведены обязательные переменные(без них запуск через node не сработает):
| ИМЯ        | ЗНАЧЕНИЕ                                                             |
| ---------- | -------------------------------------------------------------------- |
| DB_ISLOCAL | Использование sqlite вместо mysql (1-е не требует настройки). 1/0    |
| DB_LOG     | Логгировать ли транзакции. 1/0                                       |


И необязательные:

| ИМЯ                   | ЗНАЧЕНИЕ                         | ПРИМЕР       |
| --------------------- | -------------------------------- | ------------ |
| DB_USER               | Имя пользователя бд (mysql)      | postgres     |
| DB_PASS               | Пароль к выше описанному         | 12345        |
| DB_HOST               | Адрес базы данных                | localhost    |
| DB_PORT               | Порт бд, указанный при установке | 5432         |
| DB_DATABASE           | Название бд                      | goroxels     |
| DB_LOG_PATH           | Путь к логу бд (если DB_LOG=1)   | db.log       |
| SESSION_SECRET        | Уникальный код сессий аккаунтов  | trapsaregays |
| AUTH_FB_CLIENT_ID     | ID приложения в facebook         | shitbook     |
| AUTH_FB_CLIENT_SECRET | Ключ доступа приложения FB       | ayybravo     |
| AUTH_DC_CLIENT_ID     | ID приложения Discord            | 123456       |
| AUTH_DC_CLIENT_SECRET | Ключ доступа прилы Discord       | discock      |
| AUTH_VK_CLIENT_ID     | ID приложения Vkontakte          | leavevk      |
| AUTH_VK_CLIENT_SECRET | Ключ доступа прилы VK            | durov123     |

Выставляем их в *ecosystem.config.js* сервера, либо опциональным модулем *env* (`npm i env`) в файле .env сервера

Хз, вроде должно работать