
# Título: Mochileiro
## Jogo Web de Tema Medieval

### Tecnologias:
- Node.js + Express
- npm
- MySQL Server
- Git
- Bycript

### Conceitos do jogo:
Gênero: Idle, com foco em economia e progressão

Premissa:
O protagonista meio que sobrevive ao um ataque de traficantes de escravos, e toda a aldeia dele é sequestrada.


O tempo todo ele vai fazer um ciclo:
- explorar áreas
- coletar recursos
- vender ou craftar itens
- juntar dinheiro
- libertar NPC
- desbloquear sistema novo na vila


### Arquitetura:
Modelo Client x Server

No lado do cliente será toda a visualização gráfica e o input
No lado do server vai ter toda a simulação, progressão e salvamento

Para visualização gráfica vamos utilizar o phaser.js para <canvas>
(o resto do site será REST)
Pro server é o Node.js com o express
Pra fazer online vamos usar os WebSockets


### Estrutura:
O diretório por enquanto tá:

app/
│
├── server.js
│
└── src/
    │
    ├── app.js
    │
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── saveController.js
    │   └── userController.js
    │
    ├── database/
    │   └── setup.sql
    │
    ├── middlewares/
    │   ├── errorMiddleware.js
    │   └── validationMiddleware.js
    │
    ├── models/
    │   ├── saveModel.js
    │   └── userModel.js
    │
    ├── public/
    │   ├── css/
    │   │   └── style.css
    │   │
    │   └── img/
    │       ├── cacar.png
    │       ├── excluir.png
    │       ├── ferreiro.jpeg
    │       ├── interiorbau.png
    │       ├── loja.png
    │       └── pergaminho.png
    │
    ├── routes/
    │   ├── saveRoutes.js
    │   └── userRoutes.js
    │
    ├── utils/
    │   ├── customErrors.js
    │   └── generateSecret.js
    │
    └── views/
        │
        ├── cadastro.ejs
        ├── ferreiro.ejs
        ├── home.ejs
        ├── login.ejs
        ├── loja.ejs
        ├── menu.ejs
        └── saves.ejs
        │
        └── partials/
            ├── adotarPetForm.ejs
            ├── estoque.ejs
            ├── footer.ejs
            ├── head.ejs
            ├── header.ejs
            ├── inventario.ejs
            ├── savesCriados.ejs
            └── savesVazios.ejs

### Planejamento:
Os próximos passos são:
Iniciar o desenvolvimento do game loop com phaser.js
- Inventário
- Exploração
- Venda e Compra
- NPCs
- Profissionalizações
- economia offline, mapas etc

...
