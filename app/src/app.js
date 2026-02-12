import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import csrf from 'csurf';
import userRoutes from './routes/userRoutes.js';
import saveRoutes from './routes/saveRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.disable("x-powered-by");

app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

const csrfProtection = csrf({
  cookie: false
});

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario ?? null;
    res.locals.save = req.session.thesave ?? null;
    res.locals.flash = req.session.flash ?? null;
    delete req.session.flash;
    next();
});

app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get('/', (req, res) => {
  res.render('home', { titulo: 'RPG Web Project' });
});

app.use('/', userRoutes);
app.use('/', saveRoutes);

app.use(notFoundHandler);

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        console.warn(`(DEU RUIM AQUI NO CSFR) Token inválido em ${req.url}. Referer: ${req.get('Referer')}`);
        req.session.flash = { 
            tipo: 'erro', 
            mensagem: 'Erro de validação de segurança (CSRF). Por favor, recarregue a página e tente novamente.' 
        };
        return res.status(403).redirect(req.get('Referrer') || '/');
    }
    next(err);
});

app.use(errorHandler);

export default app;