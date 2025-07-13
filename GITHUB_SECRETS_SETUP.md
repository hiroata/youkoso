# Firebase Auto-Deploy Setup Guide

## Configuración General de GitHub Actions para Firebase

### 1. Generar Service Account Key en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Service accounts**
4. Haz clic en **Generate new private key**
5. Descarga el archivo JSON

### 2. Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. **New repository secret**

**Nombre del Secret:**
```
FIREBASE_SERVICE_ACCOUNT_[TU_PROYECTO_ID]
```

**Valor:**
- Copia y pega el contenido completo del archivo JSON del service account

### 3. Configurar GitHub Actions Workflow

Crear `.github/workflows/firebase-hosting-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_[TU_PROYECTO_ID] }}'
          projectId: [TU_PROYECTO_ID]
```

### 4. Configurar firebase.json

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

## ⚠️ Mejores Prácticas de Seguridad

- **NUNCA** commits service account keys en el código
- Usa solo GitHub Secrets para credenciales
- Rota las claves periódicamente
- Limita los permisos del service account
- Monitorea los logs de deploy

## Verificación

1. Push a la rama `main` debe activar el deploy automático
2. Verifica en la pestaña **Actions** de GitHub
3. Confirma el deploy en Firebase Console

---

**Nota**: Este archivo contiene instrucciones generales. Adapta los nombres de proyecto y configuraciones según tu entorno específico.
