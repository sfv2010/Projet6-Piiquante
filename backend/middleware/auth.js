//---importation---
const jwt = require("jsonwebtoken");
require("dotenv").config();

//---Exportation (vers routes sauce)---
module.exports = (req, res, next) => {
    try {
        //---Récupération le token dans le header, second élément du tableau.Le premier contien le mot "Bearer". La fonction split pour récupérer après l'espace---
        const token = req.headers.authorization.split(" ")[1];
        //---fonction verify pour décoder et vérifier notre token---
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        //---Récupération de l'userId de notre token ---
        const userId = decodedToken.userId;
        //---attribuer l'objet userId de notre token à l’objet Request afin que nos différentes routes puissent l’exploiter
        req.auth = {
            userId: userId,
        };
        //---S'il y a un userId dans le corps de la requête et que les id sont différants entre requete et token---
        if (req.body.userId && req.body.userId !== userId) {
            throw error;
        } else {
            next();
        }
    } catch (error) {
        res.status(403).json({ error });
    }
};
