module.exports = {
  apps: [{
    name: 'stok-yonetim-backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,

    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },

    // Logs
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,

    // Restart policy
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,

    // Advanced options
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
