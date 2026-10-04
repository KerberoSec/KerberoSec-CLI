# 📦 Base de Datos: Plataforma de CTFs Éticos

Este módulo contiene todo lo necesario para levantar la base de datos de la plataforma de CTFs, desarrollada en PostgreSQL. La estructura está diseñada para gestionar usuarios, retos, writeups, puntuaciones y máquinas virtuales.

---

## 📄 ¿Qué contiene este módulo?

El archivo principal es:

- **`mount_DDBB.sql`**: script SQL que crea automáticamente todas las tablas necesarias y puede insertar datos iniciales (usuarios demo, retos de ejemplo, etc.).

Con solo ejecutar este archivo, se monta toda la base de datos requerida por la aplicación sin necesidad de crear las tablas manualmente.

---

## 🛠️ Requisitos

- PostgreSQL instalado y corriendo (recomendado: versión 13 o superior).
- pgAdmin 4 o terminal de Linux con acceso a `psql`.

---

## 🚀 Cómo crear la base de datos

### Opción 1: Usando pgAdmin 4 (interfaz gráfica)

1. Abre pgAdmin 4 y conéctate a tu servidor PostgreSQL.
2. Haz clic derecho en "Databases" > **Create** > **Database**.
3. Nombra la base de datos, por ejemplo: `ctf_platform`, y haz clic en **Save**.
4. Selecciona la nueva base de datos y ve a la pestaña **Query Tool**.
5. Abre el archivo `init_ctf_db.sql` y haz clic en **▶ Ejecutar (F5)**.
6. Se crearán todas las tablas y datos automáticamente.

---

### Opción 2: Usando la Terminal de Linux

1. Asegúrate de tener PostgreSQL activo.
2. Crea la base de datos:

```bash
createdb pwn3d
```

3. Ejecuta el script SQL:

```bash
psql -d users -U postgres -f mount_DDBB_users.sql
psql -d pwn3d -U postgres -f mount_DDBB.sql
```
> Reemplaza postgres por tu usuario de PostgreSQL.

4. Verifica que las tablas se hayan creado:

```bash
psql -d pwn3d -U postgres
\dt
```

```bash
psql -d users -U postgres
\dt
```

## 🧱 Estructura de la Base de Datos

Las tablas más relevantes son:

- **usuarios**: gestiona registros y roles.
- **retos**: almacena cada máquina o desafío.
- **writeups**: documentos compartidos por la comunidad.
- **puntuaciones**: seguimiento del progreso de los usuarios.
- **envios**: retos subidos por usuarios.

Cada tabla está relacionada mediante claves foráneas para garantizar integridad referencial.

## 🗂️ Ruta del archivo `.sql`

Ubicación recomendada dentro del repositorio:

```psql
/database
  └── mount_DDBB.sql
```

## ✅ Siguiente paso

Una vez montada la base de datos, asegúrate de configurar la conexión desde el backend Java y el módulo de login en Python con las credenciales correctas.

#### ¿Problemas o sugerencias? ¡Envíanos un issue o PR! 🛠️
