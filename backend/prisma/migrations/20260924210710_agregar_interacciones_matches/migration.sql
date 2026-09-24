-- CreateTable
CREATE TABLE `Interaccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('LIKE', 'DISLIKE') NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioEmisorId` INTEGER NOT NULL,
    `usuarioDestinatarioId` INTEGER NOT NULL,

    UNIQUE INDEX `Interaccion_usuarioEmisorId_usuarioDestinatarioId_key`(`usuarioEmisorId`, `usuarioDestinatarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `usuario1Id` INTEGER NOT NULL,
    `usuario2Id` INTEGER NOT NULL,

    UNIQUE INDEX `Match_usuario1Id_usuario2Id_key`(`usuario1Id`, `usuario2Id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Interaccion` ADD CONSTRAINT `Interaccion_usuarioEmisorId_fkey` FOREIGN KEY (`usuarioEmisorId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interaccion` ADD CONSTRAINT `Interaccion_usuarioDestinatarioId_fkey` FOREIGN KEY (`usuarioDestinatarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_usuario1Id_fkey` FOREIGN KEY (`usuario1Id`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_usuario2Id_fkey` FOREIGN KEY (`usuario2Id`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
