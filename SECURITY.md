# Política de Seguridad 🔒

## Versiones Soportadas

Mantenemos parches de seguridad para las siguientes versiones del proyecto:

| Versión | Soportada          |
| ------- | ------------------ |
| 1.x.x   | ✅ Sí             |
| < 1.0   | ❌ No              |

## Reportar una Vulnerabilidad

El equipo de **Youkoso** toma muy en serio los problemas de seguridad. Agradecemos tus esfuerzos por divulgar responsablemente tus hallazgos y haremos todo lo posible por reconocer tus contribuciones.

### Cómo Reportar

Para reportar un problema de seguridad, utiliza la función de GitHub Security Advisory ["Reportar una Vulnerabilidad"](https://github.com/hiroata/youkoso/security/advisories/new).

### Información a Incluir

Por favor incluye la siguiente información en tu reporte:

- **Tipo de problema** (ej. XSS, inyección SQL, etc.)
- **Rutas completas** de los archivos de código relacionados con la manifestación del problema
- **Ubicación del código fuente afectado** (tag/branch/commit o URL directa)
- **Configuración especial requerida** para reproducir el problema
- **Instrucciones paso a paso** para reproducir el problema
- **Prueba de concepto o código de explotación** (si es posible)
- **Impacto del problema**, incluyendo cómo un atacante podría explotar el problema

### Qué Esperar

- **Confirmación**: Reconoceremos la recepción de tu reporte de vulnerabilidad en 48 horas.
- **Investigación**: Investigaremos y validaremos el problema en 5 días hábiles.
- **Actualizaciones**: Proporcionaremos actualizaciones regulares sobre nuestro progreso.
- **Resolución**: Buscamos resolver problemas críticos en 30 días.

## Medidas de Seguridad Implementadas

Este proyecto implementa varias medidas de seguridad:

### Seguridad del Frontend
- **Content Security Policy (CSP)** configurada en Firebase Hosting
- **Validación de entrada** en todos los inputs del usuario
- **Sanitización de salida** para prevenir ataques XSS
- **HTTPS obligatorio** en producción vía Firebase Hosting
- **Headers de seguridad** configurados en `firebase.json`

### Gestión de Datos
- **Almacenamiento local seguro** (localStorage para carrito)
- **No almacenamiento** de información sensible en frontend
- **Validación de datos** antes del procesamiento
- **Manejo seguro** de APIs externas (Unsplash)

### Infraestructura
- **Firebase Hosting** con CDN global y protecciones DDoS
- **Deploy automático** sin exposición de credenciales
- **GitHub Secrets** para información sensible
- **Monitoreo** de dependencias con alertas de seguridad

## Alcance de la Política

Esta política de seguridad aplica a:

- El sitio web principal de **Youkoso** y la aplicación
- Toda la infraestructura relacionada y procesos de deploy
- Integraciones y dependencias de terceros

### Fuera del Alcance

Los siguientes elementos se consideran fuera del alcance de esta política:

- Vulnerabilidades teóricas sin prueba de concepto
- Problemas en servicios de terceros que no controlamos
- Ataques de ingeniería social
- Ataques físicos
- Problemas que requieren acceso físico a servidores

## Mejores Prácticas de Seguridad para Contribuidores

Al contribuir a este proyecto, sigue estas pautas de seguridad:

### Seguridad del Código

- **Valida todas las entradas** de usuarios y fuentes externas
- **Sanitiza las salidas** para prevenir ataques XSS
- **Usa HTTPS** para todas las llamadas a APIs externas
- **No hagas commit de secretos** como API keys o contraseñas
- **Usa variables de entorno** para configuración sensible

### Gestión de Dependencias

- **Mantén las dependencias actualizadas** a las últimas versiones seguras
- **Revisa las dependencias** antes de añadir nuevas
- **Usa herramientas de escaneo** para identificar vulnerabilidades
- **Elimina dependencias no utilizadas** para reducir la superficie de ataque

### Protección de Datos

- **Minimiza la recolección de datos** solo a lo necesario
- **Maneja los datos de usuario** según las leyes de privacidad (GDPR, CCPA, etc.)
- **Usa almacenamiento seguro** para cualquier información sensible
- **Implementa controles de acceso** apropiados

## Headers de Seguridad

Este proyecto implementa los siguientes headers de seguridad en Firebase Hosting:

```json
{
  "headers": [
    {
      "source": "**",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Tecnologías de Seguridad

### Implementadas
- ✅ **Firebase Hosting**: SSL automático, CDN global, protección DDoS
- ✅ **GitHub Actions**: Deploy seguro sin exposición de credenciales
- ✅ **Content Security Policy**: Prevención de XSS
- ✅ **Input Validation**: Validación en formularios
- ✅ **Dependency Updates**: Monitoreo automático de dependencias

### Recomendadas para el Futuro
- 🔄 **Firestore Security Rules**: Cuando se implemente backend
- 🔄 **Firebase Auth**: Para autenticación de usuarios
- 🔄 **Rate Limiting**: Para prevenir abuse de APIs
- 🔄 **Web Application Firewall**: Para protección adicional

## Política de Divulgación

- **Divulgación coordinada**: Preferimos la divulgación coordinada con investigadores de seguridad
- **Divulgación pública**: Los problemas se divulgarán públicamente después de ser resueltos
- **Crédito**: Daremos crédito a los investigadores que reporten vulnerabilidades responsablemente
- **Bug bounty**: Actualmente no tenemos un programa formal de bug bounty, pero apreciamos la divulgación responsable

## Contacto

Para preguntas relacionadas con seguridad que no sean vulnerabilidades, puedes contactarnos en:

- **Email**: [security@youkoso.mx](mailto:security@youkoso.mx)
- **GitHub**: Abre un issue con la etiqueta `security`

## Marco Legal

Al enviar un reporte de vulnerabilidad, aceptas que:

- No accederás ni modificarás datos de usuario sin permiso explícito
- No realizarás pruebas que puedan dañar nuestros sistemas o usuarios
- Cumplirás con todas las leyes y regulaciones aplicables
- No divulgarás públicamente la vulnerabilidad antes de que hayamos tenido la oportunidad de abordarla

## Actualizaciones de Seguridad

- **Dependencias**: Revisión mensual y actualización de dependencias
- **Política**: Esta política se revisa y actualiza trimestralmente
- **Monitoreo**: Monitoreo continuo de alertas de seguridad
- **Respuesta**: Plan de respuesta a incidentes documentado

---

## Estado Actual de Seguridad

> ✅ **Nivel de Seguridad**: BUENO
> 
> Proyecto con medidas de seguridad básicas implementadas, hosting seguro, y buenas prácticas de desarrollo. Apropiado para aplicación e-commerce básica.

---

¡Gracias por ayudar a mantener **Youkoso** y nuestros usuarios seguros! 🔒