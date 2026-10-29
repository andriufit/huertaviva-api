# Huerta Viva · API

API REST de **Huerta Viva**, una tienda online de productos de la huerta (empresa ficticia). Da el catálogo de productos y registra los pedidos que hacen los clientes desde la web.

Este repositorio también contiene el **script de la base de datos** que usan la API y el panel de administración.

## Cómo se comunica con el resto

```
Navegador del cliente (web) ──HTTP──► API :3000 ──MySQL :3306──► Base de datos
```

| Dirección | Con quién | Protocolo / puerto | Para qué |
|---|---|---|---|
| Entrada | Navegador de los clientes que usan la **web** (`huertaviva-web`) | HTTP, puerto `PORT` (3000 por defecto) | Consultar productos y enviar pedidos |
| Salida | **Base de datos** MySQL/MariaDB | TCP 3306 | Leer productos y guardar pedidos |

- La API **no sirve páginas**: solo responde JSON en rutas que empiezan por `/api/`.
- La API habla **HTTP plano**. No gestiona certificados ni TLS.
- Escucha en la interfaz indicada en `HOST`. Por defecto es `127.0.0.1`, es decir, solo es accesible desde la propia máquina.
- El panel de administración (`huertaviva-admin`) **no usa la API**: se conecta directamente a la base de datos.
- Si el navegador llama a la API desde un dominio distinto al de la web, hay que configurar `CORS_ORIGIN`. Ver [Configuración](#configuración).

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/salud` | Estado de la API y de la conexión con la base de datos |
| GET | `/api/productos` | Lista de productos activos |
| GET | `/api/productos/:id` | Un producto |
| POST | `/api/pedidos` | Crea un pedido. Cuerpo JSON: `nombre`, `email`, `producto_id`, `cantidad`, `comentario` (opcional) |

## Requisitos

- Ubuntu Server 22.04/24.04 o Debian 12.
- **Node.js 18 o superior** y npm (`sudo apt install nodejs npm`).
- **MySQL 8 o MariaDB 10.6 o superior**, en esta máquina o en otra.

## Base de datos

Se hace una sola vez, en la máquina donde esté MySQL/MariaDB.

1. Crea la base de datos, las tablas y los productos de ejemplo:

   ```bash
   sudo mysql < database/schema.sql
   ```

2. Crea los usuarios de la API y del admin. Copia la plantilla, cambia las IPs y las contraseñas y ejecútala:

   ```bash
   cp database/usuarios.sql.example usuarios.sql
   nano usuarios.sql
   sudo mysql < usuarios.sql
   rm usuarios.sql
   ```

   Cada usuario solo tiene los permisos que necesita. La API puede leer productos y crear pedidos; nada más.

3. Si la API o el admin se conectan **desde otra máquina**, MySQL/MariaDB tiene que escuchar en una interfaz de red y no solo en `127.0.0.1`. Revisa `bind-address` en:
   - MySQL: `/etc/mysql/mysql.conf.d/mysqld.cnf`
   - MariaDB: `/etc/mysql/mariadb.conf.d/50-server.cnf`

   Después, `sudo systemctl restart mysql` (o `mariadb`).

## Configuración

Copia la plantilla y edítala:

```bash
cp .env.example .env
nano .env
```

| Variable | Descripción | Por defecto |
|---|---|---|
| `HOST` | Interfaz en la que escucha la API. `127.0.0.1` = solo local, `0.0.0.0` = todas | `127.0.0.1` |
| `PORT` | Puerto de escucha | `3000` |
| `DB_HOST`, `DB_PORT` | Dirección de la base de datos | `127.0.0.1`, `3306` |
| `DB_NAME` | Nombre de la base de datos | `huertaviva` |
| `DB_USER`, `DB_PASSWORD` | Usuario `huerta_api` y su contraseña | — |
| `CORS_ORIGIN` | Origen permitido si el navegador llama a la API desde otro dominio (por ejemplo, `https://www.huertaviva.local`). Vacío = desactivado | vacío |

## Comprobaciones

```bash
curl http://HOST:PORT/api/productos
curl -X POST http://HOST:PORT/api/pedidos \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","email":"ana@ejemplo.com","producto_id":1,"cantidad":2}'
# {"id":1,"mensaje":"Pedido registrado"}
```

Si `/api/salud` devuelve `{"estado":"error","bd":"sin conexión"}`, la API funciona pero no llega a la base de datos: revisa `DB_HOST`, el usuario y su IP en `usuarios.sql`, y `bind-address`.

## Estructura

```
huertaviva-api/
├── database/
│   ├── schema.sql              # Base de datos, tablas y datos de ejemplo
│   └── usuarios.sql.example    # Usuarios de BD para la API y el admin
├── src/
│   ├── server.js               # Arranque y configuración de Express
│   ├── db.js                   # Conexión a la base de datos
│   └── routes/
│       ├── productos.js
│       └── pedidos.js
├── .env.example
└── package.json
```
