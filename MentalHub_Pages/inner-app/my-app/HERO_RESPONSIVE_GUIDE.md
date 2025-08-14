# Guía del Hero Banner Responsive

## Descripción
Este documento explica cómo funciona el hero banner responsive y cómo personalizarlo para diferentes tamaños de pantalla. **Solo se han modificado las posiciones y escalado, manteniendo todos los colores y estilos originales.**

## Características Implementadas

### 1. Breakpoints Responsive
- **480px y menor**: Dispositivos móviles pequeños
- **640px y menor**: Dispositivos móviles grandes
- **768px y menor**: Tablets
- **1024px y menor**: Laptops
- **1025px y mayor**: Desktops

### 2. Ajustes Automáticos
- **Escalado**: El cerebro se escala automáticamente según el tamaño de pantalla
- **Posicionamiento**: Las posiciones se ajustan para mantener la visibilidad
- **Altura**: La altura del contenedor se adapta al contenido
- **Espaciado**: El padding y margin se ajustan proporcionalmente
- **Z-Index**: Asegurado que esté por debajo del header fijo

### 3. Clases CSS Disponibles

#### Hero Container
```css
.hero-visual-container  /* Contenedor de la animación con escalado responsive */
#VisionSection         /* Sección del hero con espaciado desde header */
```

## Cómo Personalizar

### 1. Ajustar Posiciones del Cerebro
Edita el archivo `components/HeroVisual.tsx`:

```tsx
<div className="absolute 
  left-[20%] sm:left-[22%] md:left-[23%] lg:left-[30%] 
  top-[-2%] sm:top-[-3%] md:top-[-4%] lg:top-[-5%]">
```

### 2. Modificar Escalado
Edita el archivo `styles/hero-responsive.css`:

```css
@media (max-width: 480px) {
  .hero-visual-container {
    transform: scale(0.65);  /* Cambia este valor */
    margin-top: 2rem;        /* Ajusta el margen superior */
  }
}
```

### 3. Ajustar Espaciado desde Header
Edita el archivo `app/globals.css`:

```css
#VisionSection {
  padding-top: 2rem; /* Espacio desde el header */
}
```

### 4. Ajustar Tamaños de Texto
Modifica las clases en `Vision.tsx`:

```tsx
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-h1">
```

## Estructura de Archivos

```
├── components/
│   └── HeroVisual.tsx          # Componente principal de la animación
├── innerComp/
│   └── Vision.tsx              # Contenedor del hero
├── styles/
│   ├── hero-responsive.css     # Estilos responsive SOLO para posicionamiento
│   └── globals.css            # Estilos globales (sin cambios de colores)
└── tailwind.config.ts          # Configuración de Tailwind (sin cambios)
```

## Solución de Problemas

### El cerebro no se ve en móvil
1. Verifica que la clase `hero-visual-container` esté aplicada
2. Ajusta el `transform: scale()` en el CSS
3. Modifica los márgenes negativos si es necesario

### El cerebro se superpone con el header
1. **SOLUCIONADO**: Se ajustó el `z-index` a 1 (por debajo del header)
2. **SOLUCIONADO**: Se aumentó el `padding-top` del hero
3. **SOLUCIONADO**: Se ajustaron los márgenes para evitar superposición

### La animación no funciona
1. Asegúrate de que `MotionImg` esté importado correctamente
2. Verifica que las imágenes estén en la ruta correcta
3. Comprueba que no haya errores en la consola

## Mejores Prácticas

1. **Solo modifica posiciones y escalado** - no cambies colores ni estilos de fondo
2. **Usa breakpoints consistentes** (sm, md, lg, xl)
3. **Prueba en dispositivos reales** cuando sea posible
4. **Mantén las proporciones** al escalar elementos
5. **Usa transiciones suaves** para cambios de tamaño
6. **Respeta el z-index del header** (9999) para evitar superposiciones

## Comandos Útiles

```bash
# Ver cambios en tiempo real
npm run dev

# Construir para producción
npm run build

# Verificar errores de linting
npm run lint
```

## Notas Importantes

- **NO se han modificado colores ni estilos de fondo**
- **Solo se han ajustado posiciones y escalado responsive**
- **PROBLEMA RESUELTO**: El cerebro ya no se superpone con el header
- Las clases CSS personalizadas solo afectan el posicionamiento
- Los breakpoints están optimizados para dispositivos móviles primero
- El escalado automático mantiene las proporciones originales
- El z-index está configurado para estar por debajo del header fijo
