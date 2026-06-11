# Ecommerce API REST

Esta es una API REST para un sistema de comercio electrónico construida con Node.js, Express, PostgreSQL y Sequelize.

## Sobre el Proyecto

Este proyecto es una API RESTful que proporciona endpoints para gestionar productos, usuarios, ventas y detalles de ventas. Utiliza un stack de tecnologías moderno de JavaScript, lo que la hace robusta y escalable.

### Construido Con

*   [Node.js](https://nodejs.org/)
*   [Express](https://expressjs.com/)
*   [PostgreSQL](https://www.postgresql.org/)
*   [Sequelize](https://sequelize.org/)

## Primeros Pasos

Para obtener una copia local en funcionamiento, sigue estos sencillos pasos.

### Prerrequisitos

Necesitarás tener Node.js y npm instalados en tu máquina.
*   npm
    ```sh
    npm install npm@latest -g
    ```
También necesitarás una instancia de PostgreSQL en ejecución.

### Instalación

1.  Clona el repositorio
    ```sh
    git clone https://URL_DEL_REPOSITORIO_AQUI
    ```
2.  Instala los paquetes NPM
    ```sh
    npm install
    ```
3. Configura tus variables de entorno. Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
    ```
    DB_USER=tu_usuario_de_db
    DB_PASSWORD=tu_contraseña_de_db
    DB_HOST=localhost
    DB_NAME=tu_nombre_de_db
    ```
4.  Ejecuta las migraciones de la base de datos (si las tienes configuradas con Sequelize CLI)
    ```sh
    npx sequelize-cli db:migrate
    ```

## Uso

Para iniciar el servidor en modo de desarrollo, ejecuta:

```sh
npm run dev
```

Esto iniciará el servidor en `http://localhost:3000` (o el puerto que hayas configurado).

### Endpoints de la API

Aquí hay algunos ejemplos de los endpoints disponibles:

*   `GET /api/productos` - Obtiene todos los productos
*   `POST /api/productos` - Crea un nuevo producto
*   `GET /api/ventas` - Obtiene todas las ventas
*   `POST /api/auth/login` - Inicia sesión de usuario

## Despliegue

Para desplegar esta aplicación en un sistema en vivo, puedes usar servicios como Heroku, AWS, DigitalOcean o cualquier otro proveedor de nube que soporte Node.js.

Asegúrate de configurar las variables de entorno en tu servidor de producción, especialmente las credenciales de la base de datos.

Un ejemplo de comando para iniciar la aplicación en producción es:

```sh
npm start
```

## Contacto

Nombre del Proyecto - Portafolio proyecto Bootcamp desarrollador fullstack js
