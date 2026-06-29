module.exports = {
  apps: [
    {
      name: "wa-akg",
      script: "npx",
      args: "tsx src/server/index.ts",
      interpreter: "none", // Avoid PM2 trying to run npx as a Node.js script directly
      watch: false,
      autorestart: true,
      max_memory_restart: "1G",
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production"
      },
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
