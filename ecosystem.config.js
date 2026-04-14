module.exports = {
  apps: [
    {
      name: 'sms-server',
      script: 'src/app.js',
      cwd: './server',
      instances: 'max',           // Cluster mode - one per CPU core
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        watch: true,
        ignore_watch: ['node_modules', 'logs', 'uploads'],
      },
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      // Restart policy
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      // Graceful shutdown
      kill_timeout: 10000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // Bull queue worker (separate process)
    {
      name: 'sms-worker',
      script: 'src/jobs/worker.js',
      cwd: './server',
      instances: 2,
      exec_mode: 'fork',         // Fork mode for workers
      watch: false,
      max_memory_restart: '256M',
      env: { NODE_ENV: 'production' },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      restart_delay: 5000,
    },
  ],
};
