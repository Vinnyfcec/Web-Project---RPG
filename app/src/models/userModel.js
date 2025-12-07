const db = require('../config/db');
const bcrypt = require('bcrypt');

class userModel {
    
        static async criarUsuario(nome_usuario, email, senha) {
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);
            const query = 'INSERT INTO usuarios (nome_usuario, email, senhaHash) VALUES (?, ?, ?)';
            const [result] = await db.execute(query, [nome_usuario, email, senhaHash]);
            return result.insertId;
        }
        static async buscarUsuarioporIdentificador(identificador) {
            const query = 'SELECT * FROM usuarios WHERE email = ? OR nome_usuario = ?';
            const [rows] = await db.execute(query, [identificador, identificador]);
            return rows[0];
        }
        static async atualizarSenhaUsuario(id, novaSenha) {
            const saltRounds = 10;
            const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);
            const query = 'UPDATE usuarios SET senha = ? WHERE id = ?';
            const [result] = await db.execute(query, [novaSenhaHash, id]);
            return result;
        }
        static async excluirUsuario(usuario_id) {
            const query = 'DELETE FROM usuarios WHERE id = ?';
            const [resultado] = await db.execute(query, [usuario_id]);
            return resultado.affectedRows > 0;
        }
        static async verificarSenha(senha, senhaHash) {
            return await bcrypt.compare(senha, senhaHash);
        }
}

module.exports = userModel;