# Flujo de uso: instalar una vez y enviar el enlace

La persona no debe ejecutar herramientas MCP manualmente ni configurar cada reunión.

## Experiencia del usuario

1. Instala el MCP en su cliente de IA.
2. Autoriza Google una sola vez.
3. Envía al agente un enlace de Google Meet.
4. Nova valida el enlace y solicita al servicio de reuniones que se una.
5. El servicio entra como participante visible, anuncia la presencia de la IA y comienza la sesión.
6. Nova escucha la transcripción, responde cuando se le habla, toma notas y prepara el resumen.
7. Al terminar, la persona puede preguntarle por la reunión sin volver a configurar nada.

## Contrato MCP mínimo

```text
join_meeting({ meeting_url, display_name, mode })
leave_meeting({ meeting_id })
meeting_status({ meeting_id })
ask_in_meeting({ meeting_id, question })
get_meeting_summary({ meeting_id })
search_meetings({ query })
```

El cliente de IA solo necesita decidir cuándo usar estas herramientas. El trabajo de audio, transcripción, voz, avatar y persistencia ocurre en el servicio backend.

## Límites

- La IA siempre aparece como participante visible.
- La reunión debe estar autorizada por el usuario y sus asistentes.
- Si Google muestra una sala de espera, un anfitrión debe admitir al agente.
- Las acciones externas o irreversibles siguen requiriendo aprobación según `agent-policy.json`.
