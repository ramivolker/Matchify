/*
  Warnings:

  - You are about to drop the column `descripcion` on the `hobbie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hobbie` DROP COLUMN `descripcion`;

-- CreateTable
CREATE TABLE `Bloqueo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioBloqueadorId` INTEGER NOT NULL,
    `usuarioBloqueadoId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Bloqueo_usuarioBloqueadorId_usuarioBloqueadoId_key`(`usuarioBloqueadorId`, `usuarioBloqueadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Bloqueo` ADD CONSTRAINT `Bloqueo_usuarioBloqueadorId_fkey` FOREIGN KEY (`usuarioBloqueadorId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bloqueo` ADD CONSTRAINT `Bloqueo_usuarioBloqueadoId_fkey` FOREIGN KEY (`usuarioBloqueadoId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
