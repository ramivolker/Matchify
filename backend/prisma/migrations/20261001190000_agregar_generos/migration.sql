-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `genero` ENUM('MASCULINO', 'FEMENINO', 'NO_BINARIO', 'OTRO') NULL;

-- CreateTable
CREATE TABLE `PreferenciaGenero` (
    `preferenciaId` INTEGER NOT NULL,
    `genero` ENUM('MASCULINO', 'FEMENINO', 'NO_BINARIO', 'OTRO') NOT NULL,

    PRIMARY KEY (`preferenciaId`, `genero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PreferenciaGenero` ADD CONSTRAINT `PreferenciaGenero_preferenciaId_fkey` FOREIGN KEY (`preferenciaId`) REFERENCES `Preferencia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
