# Ajustes del nodo Ceramic en GCP

## Resumen del diagnóstico

- **IP externa:** `34.41.166.249`
- **Servicio ceramic-one:** activo en puerto **5101** (API ceramic-one, versión 0.51.0)
- **Dominio:** ceramicnode.innerverse.care (perdido temporalmente)

## Cambios aplicados (2026-03-04)

1. **Nginx actualizado:** proxy cambiado de 7007 (js-ceramic) a 5101 (ceramic-one)
2. **Acceso por IP:** config `/etc/nginx/sites-available/ceramic-ip` con `server_name 34.41.166.249`
3. **Verificación:** `curl http://34.41.166.249/ceramic/version` → `{"version":"0.51.0"}`

## Cambios manuales (si se revierten)

### 1. Actualizar nginx para usar ceramic-one (puerto 5101)

Editar el archivo de configuración del dominio (ej. `/etc/nginx/sites-enabled/ceramicnode` o similar):

```nginx
# Cambiar esta línea:
proxy_pass http://127.0.0.1:7007;

# Por:
proxy_pass http://127.0.0.1:5101;
```

### 2. Habilitar acceso por IP (mientras no hay dominio)

Crear `/etc/nginx/sites-available/ceramic-ip`:

```nginx
# Acceso por IP para pruebas (sin dominio)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 34.41.166.249 _;

    location /ceramic/ {
        proxy_pass http://127.0.0.1:5101/ceramic/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        return 404;
    }
}
```

Activar y recargar:

```bash
sudo ln -sf /etc/nginx/sites-available/ceramic-ip /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Nota:** Si `default_server` ya está en uso, quitar `default_server` y usar solo `listen 80;` con `server_name 34.41.166.249;`.

### 3. En el proyecto my-dapp

Usar la IP para pruebas:

```bash
# .env.local
NEXT_PUBLIC_CERAMIC_URL=http://34.41.166.249
```

O en la página de verificación: `/ceramic-sdk-verify`

## Aggregator habilitado (2026-03-05)

Para que funcione la **Stream State API** (usada por `ModelInstanceClient.getDocumentState`, ceramic-debug, etc.), el nodo ceramic-one v0.51.0 requiere:

1. `--experimental-features`
2. `--object-store-url` (ej. `file://./pipeline`)
3. `--flight-sql-bind-address` (el pipeline solo se crea con esto)
4. `--aggregator true`

Se creó el override en `/etc/systemd/system/ceramic-one.service.d/aggregator.conf`:

```ini
[Service]
Environment=CERAMIC_ONE_EXPERIMENTAL_FEATURES=true
Environment=CERAMIC_ONE_OBJECT_STORE_URL=file://./pipeline
Environment=CERAMIC_ONE_FLIGHT_SQL_BIND_ADDRESS=127.0.0.1:5102
Environment=CERAMIC_ONE_AGGREGATOR=true
ExecStart=
ExecStart=/usr/local/bin/ceramic-one daemon --network in-memory --event-validation false --experimental-features --object-store-url file://./pipeline --flight-sql-bind-address 127.0.0.1:5102 --aggregator true
```

**Verificación:** Antes devolvía 400 "cannot use stream state API without enabling aggregator". Ahora devuelve 404 (stream no encontrado) o 200 con datos, según exista el stream.
