require("dotenv").config({ path: ".env.local" });

module.exports = {
    apps: [{
        name: "smartdine",
        script: "npm",
        args: "start",
        cwd: "/web/smartdine.atlantiswebservices.com",
        instances: 1,
        exec_mode: "fork",
        env: {
            ...process.env,
            NODE_ENV: "production",
            PORT: 4403
        }
    }]
}