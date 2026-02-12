import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        console.warn('[ValidationMiddleware] Erros de validação:', errorMessages);
        
        req.session.flash = {
            tipo: 'erro',
            mensagem: errorMessages[0]
        };
        
        const backURL = req.get('Referrer') || '/';
        return res.redirect(backURL);
    }
    next();
};

export const validateCadastro = [
    body('nome_usuario')
        .trim()
        .isLength({ min: 3 }).withMessage('O nome de usuário deve ter pelo menos 3 caracteres')
        .escape(),
    body('email')
        .trim()
        .isEmail().withMessage('Informe um e-mail válido')
        .normalizeEmail(),
    body('senha')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    handleValidationErrors
];

export const validateLogin = [
    body()
        .custom((value, { req }) => {
            if (!req.body.identificador && !req.body.email && !req.body.nome_usuario) {
                throw new Error('O e-mail ou nome de usuário é obrigatório');
            }
            return true;
        }),
    body('senha')
        .notEmpty().withMessage('A senha é obrigatória'),
    handleValidationErrors
];

export const validateCreateSave = [
  body('nome_save')
    .trim()
    .notEmpty().withMessage('O nome do save é obrigatório')
    .isLength({ max: 50 }).withMessage('Máximo de 50 caracteres')
    .escape(),
  handleValidationErrors
];

export const validateRenameSave = [
  body('novo_nome')
    .trim()
    .notEmpty().withMessage('O nome do save é obrigatório')
    .isLength({ max: 50 }).withMessage('Máximo de 50 caracteres')
    .escape(),
  handleValidationErrors
];

export const validateId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID inválido'),
    handleValidationErrors
];

export const validateSearch = [
    query('q')
        .optional()
        .trim()
        .escape(),
    handleValidationErrors
];