CREATE DATABASE IF NOT EXISTS `rpg_db`;
USE `rpg_db`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome_usuario` VARCHAR(45) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `senhaHash` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `saves` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `nome_save` VARCHAR(100) NOT NULL,
  `dinheiro` INT NOT NULL DEFAULT 100,
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
  `tipo` ENUM('Armadura', 'Arma_ataque', 'Escudo', 'Consumivel', 'Outro') NOT NULL,
  `raridade` ENUM('Comum', 'Raro', 'Epico', 'Lendario') NOT NULL,
  `valor_mercado` INT NOT NULL,
  `efeito_consumivel` VARCHAR(100) NULL,
  `atualizavel` BOOLEAN NOT NULL DEFAULT FALSE,
  `atributo_ataque` INT DEFAULT 0,
  `atributo_defesa` INT DEFAULT 0,
  `atributo_poder` INT GENERATED ALWAYS AS (atributo_ataque + atributo_defesa) STORED,
  `atributo_chave` VARCHAR(10) DEFAULT 'nenhum',
  `nivel_requerido` INT NOT NULL DEFAULT 1,
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
  `nome` VARCHAR(100) NOT NULL DEFAULT 'Cleitin',
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

CREATE TABLE IF NOT EXISTS `pets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `save_id` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_save_pet` (`save_id`),
  CONSTRAINT `fk_pets_saves`
    FOREIGN KEY (`save_id`)
    REFERENCES `saves` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `monstros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `save_id` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_save_monstros` (`save_id`),
  CONSTRAINT `fk_monstros_saves`
    FOREIGN KEY (`save_id`)
    REFERENCES `saves` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

INSERT INTO `itens_base` (`nome`, `descricao`, `tipo`, `raridade`, `valor_mercado`, `efeito_consumivel`, `atualizavel`,`atributo_chave`, `atributo_ataque`, `atributo_defesa`) VALUES
('Espada de Madeira', 'Uma espada simples feita de madeira. Ideal para iniciantes.', 'Arma_ataque', 'Comum', 5, NULL, TRUE, 'Ataque', 0, 0),
('Escudo de Madeira', 'Um escudo básico feito de madeira. Oferece proteção modesta.', 'Escudo', 'Comum', 5, NULL, TRUE, 'Defesa', 0, 0),
('Poção de Vida Pequena', 'Restaura uma pequena quantidade de vida quando consumida.', 'Consumivel', 'Comum', 10, 'Restaura 20 pontos de vida', FALSE, 'nenhum', 0, 0),
('Peitoral', 'Uma armadura de peito. te fará durar mais no campo de batalha.', 'Armadura', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0),
('Elmo', 'A armadura, não o personagem.', 'Armadura', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0),
('Ombreiras', 'Sim, saíram de moda, mas são melhores que nada.', 'Armadura', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0),
('Grevas', 'Basicamente calças de metal. proporcionam quase a mesma quantidade de mobilidade que você possui.', 'Armadura', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0),
('Botas', 'Para não tomar um tiro no pé, temos as novas botas Mike! bem melhores que a Subidas.', 'Armadura', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0),
('Manoplas', 'Material anti aderente, perfeitas para descontar a raiva em alguns goblins sem se sujar!', 'Armadura', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0),
('Arco Composto', 'para acertar os inimigos em uma distância segura.', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Machado', 'Criou grandes obras literárias, como Memórias Póstumas de Brás Cubas e... espera, não é esse Machado?', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Besta', 'Quase um arco, mas diferente.', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Espada de Ferro', 'Pronto, agora você pode cortar alguma coisa.', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Lança', 'Não tem granadas, não tem perfume, só lança.', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Tridente', 'Bom, você pode escolher: ser um herói ou o vilão?', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Bastão', 'Nooooossa, que arma incrível...', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Espada Grande', 'Familiar para você?', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Foice', 'Mirou no ceifeiro, acertou no fazendeiro, mas ainda deve funcionar.', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Maça', 'É pesado, é pontiagudo, quer mais o quê?', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Adaga', 'Quem dera furtividade valesse algo nesse jogo... Devs preguiçosos...', 'Arma_ataque', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Capa', 'Melhor vender, afinal NADA DE CAPAS.', 'Armadura', 'Comum', 15, NULL, TRUE, 'Ataque', 0, 0),
('Anel Dourado', 'Meu precioso!', 'Armadura', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0),
('Escudo Torre', 'Esse nem fantasma atravessa!', 'Escudo', 'Comum', 15, NULL, TRUE, 'Defesa', 0, 0);