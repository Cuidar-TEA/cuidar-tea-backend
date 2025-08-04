-- CreateTable
CREATE TABLE `agendamentos` (
    `id_agendamento` INTEGER NOT NULL AUTO_INCREMENT,
    `profissionais_id_profissional` INTEGER NOT NULL,
    `pacientes_id_paciente` INTEGER NOT NULL,
    `enderecos_id_endereco` INTEGER NOT NULL,
    `data_horario_inicio` DATETIME(0) NOT NULL,
    `duracao_consulta_minutos` INTEGER NOT NULL,
    `data_criacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('AGENDADO', 'CANCELADO', 'FINALIZADO') NOT NULL,
    `nota_atendimento` TINYINT NULL,
    `avaliacao` TEXT NULL,

    INDEX `fk_agendamentos_enderecos1_idx`(`enderecos_id_endereco`),
    INDEX `fk_profissionais_has_pacientes_pacientes1_idx`(`pacientes_id_paciente`),
    INDEX `fk_profissionais_has_pacientes_profissionais1_idx`(`profissionais_id_profissional`),
    PRIMARY KEY (`id_agendamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enderecos` (
    `id_endereco` INTEGER NOT NULL AUTO_INCREMENT,
    `estado` CHAR(2) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `apelido_endereco` VARCHAR(100) NULL,
    `cep` VARCHAR(9) NOT NULL,
    `logradouro` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(20) NOT NULL,
    `bairro` VARCHAR(100) NOT NULL,
    `complemento` VARCHAR(100) NULL,

    PRIMARY KEY (`id_endereco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidades` (
    `id_especialidade` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_especialidade` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `nome_especialidade_UNIQUE`(`nome_especialidade`),
    PRIMARY KEY (`id_especialidade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formacoes` (
    `id_formacao` INTEGER NOT NULL AUTO_INCREMENT,
    `formacao` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `formacao_UNIQUE`(`formacao`),
    PRIMARY KEY (`id_formacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horarios_trabalho` (
    `id_horario_trabalho` INTEGER NOT NULL AUTO_INCREMENT,
    `profissionais_id_profissional` INTEGER NOT NULL,
    `dia_semana` TINYINT NOT NULL,
    `horario_inicio` TIME(0) NOT NULL,
    `horario_fim` TIME(0) NOT NULL,

    INDEX `fk_horarios_trabalho_profissionais1_idx`(`profissionais_id_profissional`),
    PRIMARY KEY (`id_horario_trabalho`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `idiomas` (
    `id_idioma` INTEGER NOT NULL AUTO_INCREMENT,
    `idioma` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `idioma_UNIQUE`(`idioma`),
    PRIMARY KEY (`id_idioma`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pacientes` (
    `id_paciente` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarios_id_usuario` INTEGER NOT NULL,
    `enderecos_id_endereco` INTEGER NOT NULL,
    `nome_paciente` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `data_nascimento` DATE NOT NULL,
    `nivel_tea` ENUM('NÍVEL 1', 'NÍVEL 2', 'NÍVEL 3') NOT NULL,
    `e_titular` BOOLEAN NOT NULL,
    `nome_titular` VARCHAR(255) NULL,

    UNIQUE INDEX `cpf_UNIQUE`(`cpf`),
    INDEX `fk_pacientes_enderecos1_idx`(`enderecos_id_endereco`),
    INDEX `fk_pacientes_usuarios1_idx`(`usuarios_id_usuario`),
    PRIMARY KEY (`id_paciente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profissionais` (
    `id_profissional` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarios_id_usuario` INTEGER NOT NULL,
    `enderecos_id_endereco` INTEGER NOT NULL,
    `foto_perfil_url` VARCHAR(255) NULL,
    `nome` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `tipo_registro` ENUM('CRM', 'CRP', 'CRFa', 'CREFITO', 'CREA') NOT NULL,
    `numero_registro` VARCHAR(50) NOT NULL,
    `uf_registro` CHAR(2) NOT NULL,
    `descricao` TEXT NULL,
    `valor_consulta` DECIMAL(10, 2) NULL,
    `aceita_convenio` BOOLEAN NULL DEFAULT false,
    `atende_domicilio` TINYINT NULL DEFAULT 0,

    UNIQUE INDEX `cpf_UNIQUE`(`cpf`),
    INDEX `fk_profissionais_enderecos1_idx`(`enderecos_id_endereco`),
    INDEX `fk_profissionais_usuarios1_idx`(`usuarios_id_usuario`),
    PRIMARY KEY (`id_profissional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profissional_especialidades` (
    `profissionais_id_profissional` INTEGER NOT NULL,
    `especialidades_id_especialidade` INTEGER NOT NULL,

    INDEX `fk_especialidades_has_profissionais_especialidades1_idx`(`especialidades_id_especialidade`),
    INDEX `fk_especialidades_has_profissionais_profissionais1_idx`(`profissionais_id_profissional`),
    PRIMARY KEY (`profissionais_id_profissional`, `especialidades_id_especialidade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profissional_formacoes` (
    `formacoes_id_formacao` INTEGER NOT NULL,
    `profissionais_id_profissional` INTEGER NOT NULL,

    INDEX `fk_formacoes_has_profissionais_formacoes1_idx`(`formacoes_id_formacao`),
    INDEX `fk_formacoes_has_profissionais_profissionais1_idx`(`profissionais_id_profissional`),
    PRIMARY KEY (`formacoes_id_formacao`, `profissionais_id_profissional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profissional_idiomas` (
    `idiomas_id_idioma` INTEGER NOT NULL,
    `profissionais_id_profissional` INTEGER NOT NULL,

    INDEX `fk_idiomas_has_profissionais_idiomas1_idx`(`idiomas_id_idioma`),
    INDEX `fk_idiomas_has_profissionais_profissionais1_idx`(`profissionais_id_profissional`),
    PRIMARY KEY (`idiomas_id_idioma`, `profissionais_id_profissional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profissional_tags` (
    `tags_id_tag` INTEGER NOT NULL,
    `profissionais_id_profissional` INTEGER NOT NULL,

    INDEX `fk_tags_has_profissionais_profissionais1_idx`(`profissionais_id_profissional`),
    INDEX `fk_tags_has_profissionais_tags1_idx`(`tags_id_tag`),
    PRIMARY KEY (`tags_id_tag`, `profissionais_id_profissional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id_tag` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_tag` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `nome_tag_UNIQUE`(`nome_tag`),
    PRIMARY KEY (`id_tag`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `telefones` (
    `id_telefone` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarios_id_usuario` INTEGER NOT NULL,
    `ddd` VARCHAR(2) NOT NULL,
    `numero` VARCHAR(10) NOT NULL,
    `tipo` ENUM('CELULAR', 'RESIDENCIAL', 'COMERCIAL') NOT NULL,

    INDEX `fk_telefones_usuarios_idx`(`usuarios_id_usuario`),
    PRIMARY KEY (`id_telefone`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `data_criacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `fk_agendamentos_enderecos1` FOREIGN KEY (`enderecos_id_endereco`) REFERENCES `enderecos`(`id_endereco`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `fk_profissionais_has_pacientes_pacientes1` FOREIGN KEY (`pacientes_id_paciente`) REFERENCES `pacientes`(`id_paciente`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `fk_profissionais_has_pacientes_profissionais1` FOREIGN KEY (`profissionais_id_profissional`) REFERENCES `profissionais`(`id_profissional`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `horarios_trabalho` ADD CONSTRAINT `fk_horarios_trabalho_profissionais1` FOREIGN KEY (`profissionais_id_profissional`) REFERENCES `profissionais`(`id_profissional`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pacientes` ADD CONSTRAINT `fk_pacientes_enderecos1` FOREIGN KEY (`enderecos_id_endereco`) REFERENCES `enderecos`(`id_endereco`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pacientes` ADD CONSTRAINT `fk_pacientes_usuarios1` FOREIGN KEY (`usuarios_id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissionais` ADD CONSTRAINT `fk_profissionais_enderecos1` FOREIGN KEY (`enderecos_id_endereco`) REFERENCES `enderecos`(`id_endereco`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissionais` ADD CONSTRAINT `fk_profissionais_usuarios1` FOREIGN KEY (`usuarios_id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_especialidades` ADD CONSTRAINT `fk_especialidades_has_profissionais_especialidades1` FOREIGN KEY (`especialidades_id_especialidade`) REFERENCES `especialidades`(`id_especialidade`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_especialidades` ADD CONSTRAINT `fk_especialidades_has_profissionais_profissionais1` FOREIGN KEY (`profissionais_id_profissional`) REFERENCES `profissionais`(`id_profissional`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_formacoes` ADD CONSTRAINT `fk_formacoes_has_profissionais_formacoes1` FOREIGN KEY (`formacoes_id_formacao`) REFERENCES `formacoes`(`id_formacao`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_formacoes` ADD CONSTRAINT `fk_formacoes_has_profissionais_profissionais1` FOREIGN KEY (`profissionais_id_profissional`) REFERENCES `profissionais`(`id_profissional`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_idiomas` ADD CONSTRAINT `fk_idiomas_has_profissionais_idiomas1` FOREIGN KEY (`idiomas_id_idioma`) REFERENCES `idiomas`(`id_idioma`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_idiomas` ADD CONSTRAINT `fk_idiomas_has_profissionais_profissionais1` FOREIGN KEY (`profissionais_id_profissional`) REFERENCES `profissionais`(`id_profissional`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_tags` ADD CONSTRAINT `fk_tags_has_profissionais_profissionais1` FOREIGN KEY (`profissionais_id_profissional`) REFERENCES `profissionais`(`id_profissional`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profissional_tags` ADD CONSTRAINT `fk_tags_has_profissionais_tags1` FOREIGN KEY (`tags_id_tag`) REFERENCES `tags`(`id_tag`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `telefones` ADD CONSTRAINT `fk_telefones_usuarios` FOREIGN KEY (`usuarios_id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;
