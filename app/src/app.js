const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'senha_cookie',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario;
    res.locals.save = req.session.thesave;
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

const userRoutes = require('./routes/userRoutes');
const saveRoutes = require('./routes/saveRoutes');
app.use('/', userRoutes);
app.use('/', saveRoutes);

app.get('/', (req, res) => {
  res.render('home', { titulo: 'pagina inuail rpg' });
});

module.exports = app;