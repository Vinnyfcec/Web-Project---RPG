import dotenv from 'dotenv';
import app from './src/app.js';
dotenv.config();

const requiredEnvVars = ['SESSION_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`(ERRO CRITICO) Variaveis de ambiente faltando: ${missingVars.join(', ')}`);
    process.exit(1);
}

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando no http://localhost:${PORT}`);
});

const gracefulShutdown = (signal) => {
    console.log(`\nPedido, sinal ${signal}. Encerando o servidor...`);
    
    server.close(() => {
        console.log('Servidor HTTP fechado.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Não fechou em tempo, forçando encerramento.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));