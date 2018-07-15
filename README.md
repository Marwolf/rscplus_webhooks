# rscplus_webhooks
Webhooks for https://github.com/OrN/rscplus

## Building and Running

```
git clone https://github.com/OrN/rscplus_webhooks
cd rscplus_webhooks
npm install
node main.js
```

The first time the server is ran, it will generate a *config.js* file for you to modify.

Set all of your config options in this file accordingly.

## Using

Open your repository webhooks settings.

**Payload URL** should be set to "http://[server ip]:7777/webhook"

**Content type** should be set to "application/json"

**Secret** should be set to what you put in your *config.js* file

**Which events would you like to trigger this webhook?** should be set to "Just the push event."

**Active** should be checked.

The server should be configured correctly now, and ready to do some work.
