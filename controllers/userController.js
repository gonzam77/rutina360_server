const { User, Rol } = require('../models'); 

module.exports = {
    async getUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: [
                    'username', 'email', 'birthDate', 'gender', 
                    'height', 'weight', 'iActive'
                ],
                include: {
                    model: Rol,
                    attributes: ['name'] // Suponiendo que el modelo Rol tiene una columna 'name'
                }
            });

            if (users) {
                return res.status(200).json({ data: users });
            } 

        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ message: 'Error interno.' });
        }
    },

    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);

            if (user) {
                return res.status(200).json({ data: user });
            }

            return res.status(404).json({ message: 'Usuario no encontrado.' });

        } catch (error) {   
            console.log('Error', error);
            return res.status(500).json({ message: 'Error interno.' });
        }    
    },
    
    async createUser(req, res) {
        try {
            
        } catch (error) {
            
        }
    },

    async updateUser(req, res) {
        try {
            
        } catch (error) {
            
        }
    },
      
    async deleteUser(req, res) {
        try {
            
        } catch (error) {

        }
    }
};              