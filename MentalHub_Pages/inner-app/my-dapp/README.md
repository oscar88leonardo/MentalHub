# Innerverse DApp

Una aplicación descentralizada (DApp) construida con Next.js y Thirdweb para Innerverse.

## 🚀 Características

- **Login con Thirdweb**: Integración completa con múltiples métodos de autenticación
- **Account Abstraction**: Soporte para gasless transactions
- **Múltiples Wallets**: MetaMask, Coinbase, Rainbow, Rabby, Zerion y más
- **In-App Wallet**: Autenticación social (Google, Discord, Telegram, etc.)

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Thirdweb (para obtener Client ID)

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id_aqui
NEXT_PUBLIC_THIRDWEB_CLIENTID=tu_client_id_aqui
```

### 2. Obtener Client ID de Thirdweb

1. Ve a [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Crea una nueva aplicación o usa una existente
3. Copia el Client ID y pégalo en las variables de entorno

### 3. Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── login/          # Página de login
│   ├── dashboard/      # Dashboard principal
│   ├── layout.tsx      # Layout con ThirdwebProvider
│   └── page.tsx        # Página principal (redirección)
├── lib/
│   ├── client.ts       # Configuración del cliente Thirdweb
│   └── chain.ts        # Configuración de la cadena
```

## 🔧 Configuración de la Cadena

El proyecto está configurado para usar la cadena con ID `59902`. Puedes cambiar esto en `src/lib/chain.ts`:

```typescript
export const myChain = defineChain({
    id: 59902, // Cambia este ID por tu cadena preferida
    rpc: "https://59902.rpc.thirdweb.com/" + (process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID || ""),
});
```

## 🎨 Personalización

### Cambiar el Tema del Login

Puedes personalizar el diseño del login editando `src/app/login/page.tsx`:

- Colores del gradiente de fondo
- Logo y branding
- Opciones de autenticación disponibles
- Estilos y componentes

### Agregar Nuevas Funcionalidades

El dashboard está preparado para agregar nuevas funcionalidades:

- Perfil de usuario
- Gestión de sesiones
- Visualización de NFTs
- Y más...

## 🚨 Solución de Problemas

### Vulnerabilidades de Seguridad

El proyecto puede mostrar algunas vulnerabilidades de baja severidad relacionadas con dependencias de logging. Estas no afectan la funcionalidad principal:

```bash
# Para ver las vulnerabilidades
npm audit

# Para intentar solucionarlas (puede requerir cambios breaking)
npm audit fix --force
```

### Problemas de Conexión

Si tienes problemas con la conexión de wallets:

1. Verifica que el Client ID esté correctamente configurado
2. Asegúrate de que la cadena esté correctamente configurada
3. Revisa la consola del navegador para errores

## 📚 Recursos Adicionales

- [Documentación de Thirdweb](https://portal.thirdweb.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribución

Este es un proyecto en desarrollo. Las contribuciones son bienvenidas para:

- Mejorar la UI/UX
- Agregar nuevas funcionalidades
- Optimizar el rendimiento
- Mejorar la seguridad

## 📄 Licencia

Este proyecto es parte de Innerverse y está sujeto a los términos de licencia correspondientes.