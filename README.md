# Meeting Agent

Prototipo local de un agente de reuniones con avatar animado y adaptador NVIDIA NIM.

> Estado actual: esta versión prueba el avatar, el chat, el micrófono del navegador y las respuestas de NVIDIA. El servidor MCP y la entrada automática a Google Meet todavía están en desarrollo; por ahora no se conecta solo a una llamada real.

## 1. Requisitos

- macOS, Windows o Linux.
- Node.js 20 o superior. Compruébalo con `node --version`.
- Una API key de NVIDIA NIM. No la publiques ni la subas a GitHub.

## 2. Descargar el proyecto

```bash
git clone https://github.com/JustinLeoni/meeting-agent.git
cd meeting-agent
```

Si ya tienes el proyecto descargado, entra directamente en su carpeta:

```bash
cd /Users/tu-usuario/meeting-agent
```

## 3. Configurar NVIDIA NIM

Copia la plantilla de variables:

```bash
cp .env.example .env
```

Edita `.env` y coloca una clave nueva:

```env
NVIDIA_API_KEY=pon_aqui_tu_clave_nueva
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
PORT=8787
```

El servidor actual no carga `.env` automáticamente. Antes de arrancarlo, exporta las variables:

```bash
set -a
source .env
set +a
```

También puedes hacerlo sin crear `.env`:

```bash
export NVIDIA_API_KEY="pon_aqui_tu_clave_nueva"
export NVIDIA_MODEL="meta/llama-3.1-8b-instruct"
```

Nunca pongas la clave en `public/`, en el código del navegador, en un commit o en un mensaje.

## 4. Arrancar la aplicación

```bash
npm run dev
```

Deberías ver:

```text
Meeting Agent: http://localhost:8787
```

Abre [http://localhost:8787](http://localhost:8787) en el navegador.

## 5. Probar el agente

1. Escribe una pregunta en el campo inferior, por ejemplo: `Resume una reunión sobre el lanzamiento de una app`.
2. Pulsa **Enviar**.
3. Observa cómo Nova cambia entre los estados “Pensando”, “Hablando” y “Escuchando”.
4. Pulsa **Leer respuesta** para escuchar la respuesta.
5. Pulsa **Activar micrófono**, acepta el permiso del navegador y habla.

Chrome y Edge suelen ofrecer el mejor soporte para reconocimiento de voz del navegador.

## 6. Flujo previsto para Google Meet

Cuando terminemos el conector MCP, el uso será:

```text
Usuario: entra en https://meet.google.com/abc-defg-hij y toma notas
Nova:   valida el enlace, llama a join_meeting y anuncia su presencia
Nova:   escucha, responde, crea tareas y prepara el resumen
Usuario: ¿qué decisiones se tomaron?
Nova:   responde usando la memoria de esa reunión
```

La persona no tendrá que ejecutar comandos MCP para cada reunión. Solo instalará el MCP y autorizará Google una vez. Si Meet muestra una sala de espera, el anfitrión deberá admitir al agente.

## Autonomía y seguridad

Nova es el agente principal y usa MCP como capa de herramientas. La política está en `agent-policy.json`.

Puede actuar automáticamente para unirse a reuniones autorizadas, anunciarse, transcribir, responder, tomar notas, resumir, extraer tareas y preparar documentos. Pedirá aprobación para enviar mensajes externos, publicar cambios, ejecutar código, modificar datos compartidos o gastar dinero.

El agente debe ser visible en la reunión y anunciar la transcripción. Para una clave que ya se compartió, revócala y genera otra.

## Licencia

MIT.
