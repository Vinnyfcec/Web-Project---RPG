class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Erro 400 - Bad Request / Validação
 */
export class ValidationError extends AppError {
    constructor(message = 'Dados de entrada inválidos') {
        super(message, 400);
    }
}

/**
 * Erro 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Não autorizado. Por favor, faça login.') {
        super(message, 401);
    }
}

/**
 * Erro 403 - Forbidden
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Você não tem permissão para realizar esta ação') {
        super(message, 403);
    }
}

/**
 * Erro 404 - Not Found
 */
export class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado') {
        super(message, 404);
    }
}

export default AppError;