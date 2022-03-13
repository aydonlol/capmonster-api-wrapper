const axios = require("axios")

module.exports = class Captcha {
    constructor(key, opts) {
        this.key = key

        this.retries = opts?.max_retries || 60
        this.checkInterval = opts?.check_interval || 5000
        this.debug = opts?.debug

        if (this.debug) {
            console.info("[captcha] [debug] debugging is enabled")
            console.info("[captcha] [debug] Client has initiated:",this)
        }
    }

    async solve(sitekey, url) {
        return new Promise(async (resolve, reject) => {
            if (this.debug) console.info("[captcha] [debug] starting task",JSON.stringify({ sitekey, url },null,1))
            let task_data = await axios.post("https://api.capmonster.cloud/createTask", {
                "clientKey":this.key,
                "task":{
                    "type":"HCaptchaTaskProxyless",
                    "websiteURL":url,
                    "websiteKey":sitekey
                }
            }).catch((e) => {
                return new Error(e.toString())
            })

            if (!task_data.data?.taskId) return new Error("Task ID is not present in response")
            else if (this.debug) console.info("[captcha] [debug] created task with id",task_data.data.taskId,JSON.stringify(task_data.data,null,1))

            let task_id = task_data.data?.taskId

            let time = Date.now()
            let depth = 0
            let solver = setInterval(async () => {
                depth++
                if (depth > this.retries) {
                    clearInterval(this)
                    console.warn("[captcha]","Max of "+this.retries+" tries reached")
                    return new Error("Max of "+this.retries+" tries reached")
                }
                let captcha_data = await axios.post("https://api.capmonster.cloud/getTaskResult", {
                    "clientKey":this.key,
                    "taskId": task_id
                }).catch((e) => {
                    console.warn("[captcha]",e.toString())
                })
                if (captcha_data.data?.status === "processing") {
                    if (this.debug) console.info("[captcha] [debug] could not get callback token",`[attempt=${depth},time=${Math.floor((Date.now() - time)/1000)}s]`,{ task_id })
                    if (this.debug) console.info("[captcha] [debug] attempt",depth)
                    return
                } else if (captcha_data.data?.solution?.gRecaptchaResponse) {
                    clearInterval(solver)
                    if (this.debug) console.info("[captcha] [debug] got callback token after "+depth+" attempts and "+Math.floor((Date.now() - time)/1000)+"s")
                    return resolve(captcha_data.data.solution.gRecaptchaResponse)
                }
            },this.checkInterval)
          });
    }
}