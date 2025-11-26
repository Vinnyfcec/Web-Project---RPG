CREATE DATABASE IF NOT EXISTS `rpg_db`;
USE `rpg_db`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome_usuario` VARCHAR(45) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `senha_hash` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `saves` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `nome_save` VARCHAR(100) NOT NULL,
  `dinheiro` INT NOT NULL DEFAULT 10,
  `nivel` INT NOT NULL DEFAULT 1,
  `itens_adquiridos` INT NOT NULL DEFAULT 0,
  `data_ultima_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuario_nome` (`usuario_id`, `nome_save`),
  CONSTRAINT `fk_saves_usuarios`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `itens_base` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL UNIQUE,
  `descricao` TEXT,
  `tipo` ENUM('Armadura', 'Escudo', 'Arma_ataque', 'Consumivel', 'Outro') NOT NULL,
  `raridade` ENUM('Comum', 'Raro', 'Epico', 'Lendario') NOT NULL,
  `valor_mercado` INT NOT NULL,
  `efeito_consumivel` VARCHAR(100) NULL,
  `atributo_ataque` INT DEFAULT 0,
  `atributo_defesa` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `inventario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `save_id` INT NOT NULL,
  `item_base_id` INT NOT NULL,
  `quantidade` INT NOT NULL DEFAULT 1,
  `equipado` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_save_item` (`save_id`, `item_base_id`),
  CONSTRAINT `fk_inventario_saves`
    FOREIGN KEY (`save_id`)
    REFERENCES `saves` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_inventario_itens_base`
    FOREIGN KEY (`item_base_id`)
    REFERENCES `itens_base` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `atributos_personagem` (
  `save_id` INT NOT NULL,
  `vida_maxima` INT NOT NULL DEFAULT 100,
  `vida_atual` INT NOT NULL DEFAULT 100,
  `ataque` INT NOT NULL DEFAULT 10,
  `defesa` INT NOT NULL DEFAULT 10,
  `experiencia` INT NOT NULL DEFAULT 0,
  `nivel` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`save_id`),
  CONSTRAINT `fk_atributos_personagem_saves`
    FOREIGN KEY (`save_id`)
    REFERENCES `saves` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;