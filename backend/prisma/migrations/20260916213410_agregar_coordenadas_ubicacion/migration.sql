-- Agregar las coordenadas sin exigir valores a las filas existentes todavia.
ALTER TABLE `Ubicacion`
    ADD COLUMN `latitud` DOUBLE NULL,
    ADD COLUMN `longitud` DOUBLE NULL;

-- Completar Rosario con las coordenadas aproximadas de ciudad acordadas.
UPDATE `Ubicacion`
SET `latitud` = -32.9468,
    `longitud` = -60.6393
WHERE `id` = 2;

-- Establecer el estado final requerido por schema.prisma, sin defaults.
ALTER TABLE `Ubicacion`
    MODIFY COLUMN `latitud` DOUBLE NOT NULL,
    MODIFY COLUMN `longitud` DOUBLE NOT NULL;
