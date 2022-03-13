# hcaptcha
### example usage
```js
const Captcha = require("@neumatic/captcha-monster")

const client = new Captcha("your-key", {
    max_retries: 60, // default 60
    check_interval: 5000, //default 5000
    debug: true // default false
})

(async () => {
    console.log("start")
    // solve
    const token = await client.solve("4c672d35-0701-42b2-88c3-78380b0db560", "https://discord.com")
    console.log("hCaptcha token:",token)
})()
```