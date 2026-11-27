# Meeting Agent

Prototipo local de un agente de reuniones con avatar animado y adaptador NVIDIA NIM.

## Autonomía del agente

Nova es el agente principal y usa MCP como capa de herramientas. La política está en `agent-policy.json`.

Por defecto puede unirse a reuniones autorizadas, anunciarse, transcribir, responder cuando se le pregunte, tomar notas, resumir, extraer tareas y preparar documentos. Las acciones externas o irreversibles —enviar mensajes, publicar cambios, ejecutar código, modificar datos compartidos o gastar dinero— requieren aprobación humana.

La persona define el objetivo y los límites; Nova coordina el trabajo y mantiene el estado de la reunión. El agente siempre debe ser visible y anunciar la transcripción.

## Ejecutar

1. Copia `.env.example` a `.env` y configura `NVIDIA_API_KEY` y, opcionalmente, `NVIDIA_MODEL`.
2. Exporta las variables en tu terminal (el servidor no lee `.env` automáticamente): `export NVIDIA_API_KEY='...'`.
3. Ejecuta `npm run dev` y abre `http://localhost:8787`.

La clave nunca debe ir en el frontend, en Git ni en mensajes. Para una clave que ya se compartió, revócala y genera otra.
