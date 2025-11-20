const db = require('../config/db');

class userModel {
    
        static async criarUsuario(nome, email, senha, confirmarSenha) {
            const query = 'INSERT INTO usuarios (nome, email, senha, confirmar_senha) VALUES (?, ?, ?, ?)';
            const [result] = await db.execute(query, [nome, email, senha, confirmarSenha]);
            return result;
        }
        static async buscarUsuarioporIdentificador(identificador) {
            const query = 'SELECT * FROM usuarios WHERE email = ? OR nome = ?';
            const [rows] = await db.execute(query, [identificador, identificador]);
            return rows[0];
        }
        static async atualizarSenhaUsuario(id, novaSenha) {
            const query = 'UPDATE usuarios SET senha = ? WHERE id = ?';
            const [result] = await db.execute(query, [novaSenha, id]);
            return result;
        }
        static async excluirUsuario(usuario_id) {
            const query = 'DELETE FROM usuarios WHERE id = ?';
            const [resultado] = await db.execute(query, [usuario_id]);
            return resultado.affectedRows > 0;
        }
        static async verificarSenha(senha, senha_hash) {
            return await bycrypt.compare(senha, senha_hash);
        }
}

module.exports = userModel;