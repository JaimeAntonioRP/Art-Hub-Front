// PM2: mantiene encendido el sitio en el VPS y lo reinicia si se cae o al reiniciar el servidor.
//   pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: "arthub-front",
      script: "node_modules/next/dist/bin/next",
      // Solo escucha en el propio servidor: al público llega por Nginx (deploy/nginx-front.conf).
      args: "start -p 3000 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      max_memory_restart: "500M",
    },
  ],
};
