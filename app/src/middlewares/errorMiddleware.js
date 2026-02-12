export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    console.error(`[${new Date().toISOString()}] ${err.stack}`);

    if (req.xhr || req.headers.accept.includes('json')) { // por nós
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    if (err.statusCode === 404) {
        return res.status(404).render('home', { 
            titulo: 'Página Não Encontrada',
            flash: { tipo: 'erro', mensagem: 'A página que você procura não existe.' }
        });
    }
    const message = err.isOperational ? err.message : 'Algo deu muito errado no servidor!';
    req.session.flash = { tipo: 'erro', mensagem: message };
    res.status(err.statusCode).redirect('/');
};

export const notFoundHandler = (req, res, next) => {
    const err = new Error(`Não foi possível encontrar ${req.originalUrl} neste servidor`);
    err.statusCode = 404;
    next(err);
};