-- Base de datos de Huerta Viva
-- Crea la base de datos, las tablas y unos productos de ejemplo.
-- Ejecutar una sola vez, como administrador de MySQL/MariaDB:
--   sudo mysql < database/schema.sql

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS huertaviva
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE huertaviva;

CREATE TABLE IF NOT EXISTS productos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100)  NOT NULL,
  descripcion VARCHAR(500)  NOT NULL DEFAULT '',
  precio      DECIMAL(8,2)  NOT NULL,
  unidad      VARCHAR(20)   NOT NULL DEFAULT 'kg',
  stock       INT UNSIGNED  NOT NULL DEFAULT 0,
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  creado_en   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producto_id    INT UNSIGNED  NOT NULL,
  cantidad       INT UNSIGNED  NOT NULL,
  nombre_cliente VARCHAR(100)  NOT NULL,
  email_cliente  VARCHAR(150)  NOT NULL,
  comentario     VARCHAR(500)  NOT NULL DEFAULT '',
  estado         ENUM('pendiente', 'preparado', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  creado_en      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedidos_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
);

CREATE TABLE IF NOT EXISTS admin_usuarios (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario       VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, descripcion, precio, unidad, stock) VALUES
  ('Tomate rosa',       'Tomate de huerta, cultivo ecológico.',          3.20, 'kg',     40),
  ('Lechuga romana',    'Recogida el mismo día del envío.',              1.10, 'unidad', 60),
  ('Calabacín',         'Calabacín verde de temporada.',                 1.90, 'kg',     35),
  ('Pimiento italiano', 'Ideal para freír.',                             2.60, 'kg',     25),
  ('Huevos camperos',   'Docena de huevos de gallinas en libertad.',     4.50, 'docena', 30),
  ('Miel de romero',    'Tarro de 500 g de miel local.',                 7.80, 'tarro',  15);
