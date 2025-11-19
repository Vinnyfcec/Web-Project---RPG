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
  secret: process.env.SESSION_SECRET || 'senha_cookie',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//const userRoutes = require('./routes/userRoutes');
//const saveRoutes = require('./routes/saveRoutes');
//const lojaRoutes = require('./routes/lojaRoutes');
//app.use('/', userRoutes);
//app.use('/', saveRoutes);
//app.use('/', lojaRoutes);

app.get('/', (req, res) => {
  res.render('home', { titulo: 'pagina inuail rpg' }); //é render k7, n sf
});

module.exports = app;
