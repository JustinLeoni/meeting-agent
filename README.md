# Meeting Agent

Prototipo local de un agente de reuniones con avatar animado y adaptador NVIDIA NIM.

## Ejecutar

1. Copia `.env.example` a `.env` y configura `NVIDIA_API_KEY` y, opcionalmente, `NVIDIA_MODEL`.
2. Exporta las variables en tu terminal (el servidor no lee `.env` automáticamente): `export NVIDIA_API_KEY='...'`.
3. Ejecuta `npm run dev` y abre `http://localhost:8787`.

La clave nunca debe ir en el frontend, en Git ni en mensajes. Para una clave que ya se compartió, revócala y genera otra.
