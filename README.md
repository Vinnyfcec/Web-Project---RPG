# Web-Project---RPG

Descrição do Projeto:

Este projeto é um projeto de web full-stack desenvolvida com foco em tema de RPG, é uma plataforma para gerenciamento de usuários e um sistema de salvamento de progresso, sendo base pro nosso jogo de RPG.

A arquitetura do projeto é composta por Node.js, utilizando o framework Express.js para o backend. 
O projeto tem:

• Autenticação de Usuários: Utiliza bcrypt para o hash seguro de senhas e express-session para gerenciar sessões do usuário

• Banco de dados: Conecta-se a um banco de dados MySQL para armazenar dados de usuários e atualizar as informações do save

• Renderização Dinâmica: As páginas são renderizadas dinamicamente usando EJS

•   Proteção CSRF: Proteção contra Cross-Site Request Forgery para todas as requisições POST.

•   Validação de Entrada: Validação e sanitização robusta de todos os dados de entrada do usuário usando `express-validator`.

• Tratamento de Erros Centralizado: Middleware de erro global e classes de erro customizadas para uma gestão consistente e informativa de exceções.



Integrantes do Grupo:

• Davi Felipe (p1vete)
• José Lopes (Supemercado)
• Guilherme Henrique (HomemPurpura)
• Vinícius Custódio (Vinnyfcec)


Instruções de Instalação e Execução:

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

Pré-requisitos:
Certifique-se de ter os seguintes softwares instalados:

-   Node.js: Versão 18.x ou superior.
-   pnpm: Gerenciador de pacotes (alternativamente, `npm` ou `yarn` podem ser usados).
-   MySQL Server: Versão 8.x ou superior.
-   Git: Para clonar o repositório.

1. Clonagem do Repositório

Clone o repositório para sua máquina local usando o Git:
``` sh
git clone https://github.com/Vinnyfcec/Web-Project---RPG.git
cd Web-Project---RPG
```


2. Instalação de Dependências

Instale todas as dependências do projeto listadas no package.json:

````sh
npm install

````

3. Configuração do Banco de Dados

1. Execute o script sql para gerar o Banco de dados necessário.

2. Crie um arquivo .env na raiz do projeto (Web-Project---RPG/) para armazenar as variáveis de ambiente:

``` sh
# configuração do servidor
PORT=3000
NODE_ENV=development

# configuração do banco mysql
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=rpg_db

# chave pras sessões
SESSION_SECRET=sua_chave_secreta_aqui
```
Para gerar um `SESSION_SECRET` seguro, execute o script:

    ```bash
    node app/src/utils/generateSecret.js
    ```
    Copie o valor gerado e cole no seu arquivo `.env`.

4. Executar o projeto

Inicie o servidor Node.js usando o script de inicialização:

```sh 
npm start
```

A página vai tá disponivel em http://localhost:3000 (ou na porta definida na variável PORT em .env).

