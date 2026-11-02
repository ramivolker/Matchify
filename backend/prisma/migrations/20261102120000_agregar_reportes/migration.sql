-- CreateTable
CREATE TABLE `Reporte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioReportanteId` INTEGER NOT NULL,
    `usuarioReportadoId` INTEGER NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(300) NULL,
    `estado` ENUM('PENDIENTE', 'RESUELTO', 'DESCARTADO') NOT NULL DEFAULT 'PENDIENTE',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resueltoEn` DATETIME(3) NULL,

    INDEX `Reporte_estado_creadoEn_idx`(`estado`, `creadoEn`),
    INDEX `Reporte_usuarioReportanteId_idx`(`usuarioReportanteId`),
    INDEX `Reporte_usuarioReportadoId_idx`(`usuarioReportadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reporte` ADD CONSTRAINT `Reporte_usuarioReportanteId_fkey` FOREIGN KEY (`usuarioReportanteId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reporte` ADD CONSTRAINT `Reporte_usuarioReportadoId_fkey` FOREIGN KEY (`usuarioReportadoId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
