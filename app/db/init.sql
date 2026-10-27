-- Se ejecuta automáticamente la primera vez que MySQL arranca con el volumen vacío
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO clientes (nombre) VALUES ('ISUR Cloud Services');
