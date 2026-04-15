# Overlay Panel Pro

Panel angosto para controlar zócalos y overlay para OBS.

## Incluye
- Panel de control compacto
- Overlay listo para OBS
- 3 títulos preparados
- Hora en vivo
- Clima con buscador de ciudad
- 5 themes
- URL para copiar al Browser Source de OBS
- Soporte para Firebase en tiempo real
- Fallback local si Firebase no está configurado

## Rutas
- `/control/demo`
- `/overlay/demo`

Podés cambiar `demo` por el nombre de canal que quieras, por ejemplo:
- `/control/apocalipsis-manana`
- `/overlay/apocalipsis-manana`

## Instalar
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Firebase
Si ya tenés Firebase, copiá `.env.example` a `.env` y completá tus credenciales.

La app usa Firestore si detecta configuración válida.
Si no, usa almacenamiento local para pruebas en la misma PC/navegador.

## Firestore sugerido
Colección:
- `overlayChannels`

Documento:
- `overlayChannels/{channelId}`

## Reglas básicas sugeridas para pruebas
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /overlayChannels/{channelId} {
      allow read, write: if true;
    }
  }
}
```

Después conviene cerrarlo con autenticación.
