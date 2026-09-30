# Proyecto de Gestión de Usuarios con Flask + Flet

Este proyecto (Parte de Python) es una aplicación web y de escritorio híbrida desarrollada con **Flask** (backend API) y **Flet** (interfaz de usuario) que permite gestionar usuarios, incluyendo funcionalidades como registro, inicio de sesión, actualización de perfil, cambio de contraseña y eliminación de cuenta. Utiliza **PostgreSQL** como base de datos y **JWT (JSON Web Tokens)** para autenticación segura.

## Características

- Registro de nuevos usuarios con validación de datos.
- Inicio de sesión con verificación de credenciales y token JWT.
- Actualización de datos del perfil.
- Cambio de contraseña seguro.
- Eliminación de cuenta.
- Gestión de sesiones con cookies seguras.
- Interfaz de usuario moderna con **Flet**.
- API REST construida con **Flask**.
- Acceso y protección de rutas con JWT.
- Conexión a base de datos PostgreSQL.

## Requisitos

- Python 3.11
- PostgreSQL (debes tener la base de datos configurada y en funcionamiento)

## Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/h4ck3nd/PROYECTO_Pwn3d.git
cd PROYECTO_Pwn3d/
```

### 2. Crea un entorno virtual con Python 3.11

```bash
python3.11 -m venv .venv
```

### 3. Activa el entorno virtual

En Linux/macOS:

```bash
source .venv/bin/activate
```

En Windows:

```bash
.venv\Scripts\activate
```

### 4. Instala las dependencias

```bash
pip install -r requirements.txt
```

### 5. Configura la base de datos

Asegúrate de tener una base de datos `PostgreSQL` llamada `users` con una tabla `usuarios` con las siguientes columnas:

```sql
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    usuario VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol VARCHAR(10) DEFAULT 'user',
    ultimo_login TIMESTAMP
);

-- Añadir la columna "Cookie" a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN cookie VARCHAR(255) UNIQUE;
```

### 6. Ejecuta la aplicación

```bash
python main.py
```

Esto iniciará el servidor Flask en `http://localhost:5000` y abrirá la interfaz con Flet como una ventana de escritorio en `http://localhost:3000`.

## Estructura del archivo `main.py`

Flask Backend: Define rutas como `/login`, `/actualizar-datos`, `/logout`, `/eliminar-cuenta`, etc.

JWT: Seguridad basada en tokens para autenticar y proteger rutas.

PostgreSQL: Almacena y gestiona la información de los usuarios.

Flet UI: Interfaz de usuario de escritorio donde se realiza el registro y login.

Multihilo: Usa threading para correr `Flask` y `Flet` al mismo tiempo.

## Notas

Si usas `HTTPS`, cambia `secure=False` a `secure=True` en la configuración de cookies.

Este proyecto es ideal para estudios de login seguro, JWT, y desarrollo híbrido web/escritorio.

## Autor

Desarrollado por [d1se0 y Manu]
