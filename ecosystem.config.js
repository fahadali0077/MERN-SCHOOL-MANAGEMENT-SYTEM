module.exports = {
  apps: [
    {
      name: 'sms-server',
      script: 'src/app.js',
      cwd: './server',
      // FIX: inline Bull queue processors run in THIS process. Cluster mode ('max')
      // would register the processors in every worker and double-process jobs, so we
      // run a single instance. (To scale out, move processors to a dedicated worker.)
      instances: 1,
      exec_mode: 'fork',
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
      listen_timeout: 10000,
    },

    // NOTE: Bull queue processors run INLINE in the app process (see server/src/jobs/index.js,
    // initialised from app.js after Redis connects). A separate worker process is intentionally
    // NOT defined here — running both would double-process every job. To scale workers out later,
    // move processors into worker.js, stop calling initQueues() from app.js, and add a fork-mode
    // app entry for src/jobs/worker.js.
  ],
};
