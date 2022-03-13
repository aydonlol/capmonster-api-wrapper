const Captcha = require("./index.js")

let client = new Captcha("key", {
    max_retries: 60,
    check_interval: 5000,
    debug: true
})

let a = (async () => {
    console.log("start")
    let captcha = await client.solve("4c672d35-0701-42b2-88c3-78380b0db560","https://discord.com")
    console.log("callback",captcha)
})
a()