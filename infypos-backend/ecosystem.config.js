module.exports = {
  apps: [
    {
      name: 'infypos-backend',
      script: './src/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      time: true,
    },
  ],
}
