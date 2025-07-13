# Guía de Contribución 🤝

¡Gracias por tu interés en contribuir a **Youkoso**! Esta guía te ayudará a entender cómo puedes contribuir al proyecto de manera efectiva.

## 📋 Tabla de Contenidos

- [Tipos de Contribución](#tipos-de-contribución)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Funcionalidades](#sugerir-funcionalidades)
- [Pull Requests](#pull-requests)

## 🎯 Tipos de Contribución

Puedes contribuir de varias maneras:

- **🐛 Reporte de bugs**: Ayúdanos a identificar y corregir errores
- **💡 Nuevas funcionalidades**: Propón o implementa nuevas características
- **📝 Documentación**: Mejora o traduce la documentación
- **🎨 Diseño**: Mejoras en UI/UX
- **🚀 Performance**: Optimizaciones de rendimiento
- **🌐 Traducción**: Añadir soporte para nuevos idiomas
- **✅ Testing**: Añadir o mejorar pruebas

## 🛠️ Configuración del Entorno

### Prerrequisitos

- Git
- Node.js (v16 o superior)
- Navegador web moderno
- Editor de código (recomendado: VS Code)
- Firebase CLI (opcional)

### Configuración

1. **Fork del repositorio**
   - Ve a [https://github.com/hiroata/youkoso](https://github.com/hiroata/youkoso)
   - Haz clic en "Fork" en la esquina superior derecha

2. **Clona tu fork**
   ```bash
   git clone https://github.com/TU_USUARIO/youkoso.git
   cd youkoso
   ```

3. **Configura el remote upstream**
   ```bash
   git remote add upstream https://github.com/hiroata/youkoso.git
   ```

4. **Inicia un servidor local**

   ```bash
   # Instalar dependencias
   npm install
   
   # Servidor de desarrollo (recomendado)
   npm run dev              # Puerto 3000
   
   # Servidor Firebase local
   npm run firebase:serve   # Puerto 5000
   
   # Alternativa simple
   python -m http.server 8000
   ```

5. **Archivos clave para desarrollo**
   - **CSS**: `css/style-simple.css` (sistema de diseño)
   - **JS Principal**: `js/core.js` (APIs y funciones principales)
   - **Datos**: `data/data.json` (productos), `data/blogs.json`
   - **Documentación**: `PROJECT_STATUS.md`, `DESIGN_SYSTEM.md`

## 🔄 Flujo de Trabajo

### Para cada contribución:

1. **Sincroniza con upstream**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Crea una nueva rama**
   ```bash
   git checkout -b feature/nombre-descriptivo
   # o
   git checkout -b fix/descripcion-del-bug
   ```

3. **Realiza tus cambios**
   - Edita los archivos necesarios
   - Prueba tus cambios localmente
   - Sigue los [estándares de código](#estándares-de-código)

4. **Commit tus cambios**
   ```bash
   git add .
   git commit -m "Descripción clara de los cambios"
   ```

5. **Push a tu fork**
   ```bash
   git push origin feature/nombre-descriptivo
   ```

6. **Crea un Pull Request**
   - Ve a tu fork en GitHub
   - Haz clic en "New Pull Request"
   - Rellena la plantilla del PR

## 📏 Estándares de Código

### HTML
- Usar indentación de 4 espacios
- Elementos HTML5 semánticos
- Atributos en orden: `class`, `id`, otros
- Alt text para todas las imágenes

```html
<article class="product-card" id="product-123">
    <img src="image.jpg" alt="Descripción del producto" loading="lazy">
    <h3>Título del Producto</h3>
</article>
```

### CSS
- **Archivo principal**: `css/style-simple.css` (NO usar `style.css`)
- **Variables CSS**: Usar siempre las variables del sistema de diseño
- **Metodología**: BEM para nombres de clases
- **Orden**: layout, visual, typography

```css
.product-card {
    /* Layout */
    display: flex;
    flex-direction: column;
    
    /* Visual */
    background-color: var(--card-bg);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    
    /* Typography */
    font-family: 'Inter', sans-serif;
}
```

**Variables principales disponibles**:
```css
/* Colores */
--primary-color: #2c3e50;
--accent-color: #3498db;
--text-color: #2c3e50;
--bg-color: #ffffff;
--card-bg: #ffffff;

/* Espaciado */
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;

/* Efectos */
--radius: 8px;
--shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
--transition: all 0.3s ease;
```

### JavaScript
- Usar ES6+ features
- Funciones descriptivas
- Comentarios para lógica compleja
- Manejo de errores apropiado

```javascript
/**
 * Filtra productos por categoría
 * @param {Array} products - Array de productos
 * @param {string} category - Categoría a filtrar
 * @returns {Array} Productos filtrados
 */
function filterProductsByCategory(products, category) {
    try {
        return products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    } catch (error) {
        console.error('Error al filtrar productos:', error);
        return [];
    }
}
```

## 🐛 Reportar Bugs

Antes de reportar un bug:

1. **Verifica** que no esté ya reportado en [Issues](https://github.com/hiroata/youkoso/issues)
2. **Reproduce** el bug en la última versión
3. **Reúne información** sobre el entorno (navegador, OS, etc.)

### Template para reporte de bugs:

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '....'
3. Desplázate hacia '....'
4. Ver error

**Comportamiento Esperado**
Lo que esperabas que pasara.

**Screenshots**
Si aplica, añade screenshots.

**Información del Entorno:**
- OS: [e.g. Windows 10]
- Navegador: [e.g. Chrome 91.0]
- Versión: [e.g. 1.2.3]
```

## 💡 Sugerir Funcionalidades

Para proponer nuevas funcionalidades:

1. **Busca** si ya existe una propuesta similar
2. **Describe** claramente la funcionalidad
3. **Explica** por qué sería útil
4. **Proporciona** mockups o ejemplos si es posible

## 📬 Pull Requests

### Antes de enviar un PR:

- ✅ Los cambios funcionan correctamente
- ✅ El código sigue los estándares establecidos
- ✅ Se han probado en diferentes navegadores
- ✅ La documentación está actualizada si es necesario
- ✅ Los commits tienen mensajes descriptivos

### Template de PR:

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Cambio breaking
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas.

## Checklist:
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código, especialmente en áreas difíciles
- [ ] He realizado cambios correspondientes en la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He probado que mi fix es efectivo o mi funcionalidad trabaja
```

## 🔍 Revisión de Código

Los mantenedores revisarán tu PR y pueden:
- **Aprobar** y hacer merge
- **Solicitar cambios** con comentarios específicos
- **Rechazar** si no se alinea con los objetivos del proyecto

## 🏷️ Convenciones de Commits

Usa el formato [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(alcance): descripción

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato, espacios, etc.
- `refactor`: Cambios de código que no corrigen bugs ni añaden funcionalidades
- `perf`: Cambios que mejoran el rendimiento
- `test`: Añadir o corregir tests
- `chore`: Cambios en herramientas, configuración, etc.

**Ejemplos:**
```
feat(products): añadir filtro por precio
fix(cart): corregir cálculo de total
docs(readme): actualizar instrucciones de instalación
```

## 🎉 Reconocimiento

Todos los contribuidores serán reconocidos en:
- README.md del proyecto
- Página "Acerca de" del sitio web
- Releases notes cuando aplique

## 📚 Documentación del Proyecto

Antes de contribuir, revisa la documentación actualizada:

- **[PROJECT_STATUS.md](PROJECT_STATUS.md)**: Estado completo del proyecto
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**: Guía del sistema de diseño
- **[README.md](README.md)**: Información general y setup
- **[SECURITY.md](SECURITY.md)**: Políticas de seguridad

## 🚀 Estado Actual del Proyecto

### ✅ **Completado (Evitar modificar sin consultar)**
- Sistema de diseño unificado (`css/style-simple.css`)
- Funcionalidad e-commerce básica (productos, carrito, navegación)
- PWA implementada y deploy automático
- Blog con 5 artículos culturales
- Estructura de archivos optimizada

### 🎯 **Áreas de Expansión Recomendadas**
- **Backend**: Implementar Firestore, autenticación
- **Pagos**: Integrar pasarela de pagos (Stripe/PayPal)
- **Admin Panel**: Expandir funcionalidades CRUD
- **Funcionalidades**: Reviews, wishlist, analytics

## 📞 ¿Necesitas Ayuda?

- **GitHub Issues**: Para bugs y nuevas funcionalidades
- **Email**: [contacto@youkoso.mx](mailto:contacto@youkoso.mx)
- **Documentación**: Consulta los archivos `.md` del proyecto

## 📄 Código de Conducta

Este proyecto se adhiere al [Contributor Covenant](https://www.contributor-covenant.org/). Al participar, te comprometes a mantener un ambiente acogedor y respetuoso para todos.

---

**Estado**: ✅ Proyecto funcional completo - Listo para expansión avanzada

¡Gracias por contribuir a **Youkoso**! 🎌✨
