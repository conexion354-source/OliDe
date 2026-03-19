STUDIO OVERLAY PRO

1) Subí todos los archivos a un repositorio de GitHub.
2) Activá GitHub Pages en Settings > Pages > Deploy from a branch > main / root.
3) La app queda en:
   https://TU-USUARIO.github.io/TU-REPO/
4) La URL para OBS es:
   https://TU-USUARIO.github.io/TU-REPO/?view=overlay

PARA MANEJARLO DESDE OTRA PC:
- Abrí la misma URL del panel en la otra PC.
- En ambas PCs pegá el mismo firebaseConfig.
- En ambas usá la misma sala compartida.
- Tocá "Conectar sincronización".

CÓMO CONSEGUIR firebaseConfig:
- Crear proyecto en Firebase.
- Agregar una Web App.
- Habilitar Realtime Database en modo de prueba.
- Copiar el objeto firebaseConfig.
- Pegarlo en la app.

REGLAS BÁSICAS DE REALTIME DATABASE (temporales para prueba):
{
  "rules": {
    ".read": true,
    ".write": true
  }
}

Cuando ya funcione, conviene restringir seguridad.
