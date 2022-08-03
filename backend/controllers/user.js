//---Configurez les routes d'authentification coté implémentation de la logique métier.

//---Importation---
const bcrypt = require("bcrypt"); //pour le cryptage de mots de passe
const cryptoJs = require("crypto-js"); //pour le cryptage d'email
const jwt = require("jsonwebtoken"); //Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token.
const User = require("../models/User");
require("dotenv").config(); //importation de dotenv

//---Logique métier ---

//---Pour enregistrer un nouvel utilisateur---
exports.signup = (req, res, next) => {
    //Pour crypter des emails
    const emailCrypto = cryptoJs.HmacSHA256(req.body.email, process.env.PASSWORD_SECRET).toString();
    //La méthode hash() de bcrypt crée un hash crypté des mots de passe de nos utilisateurs pour les enregistrer de manière sécurisée dans la base de données.
    bcrypt
        .hash(req.body.password, 10) // (le mot de passe du corps de la rêquête qui sera pqssé par le frontend, le salt,c'est combien de fois on execute l'algo de hashage (ici 10fois)
        .then((hash) => {
            const user = new User({
                email: emailCrypto,
                password: hash,
            });
            user.save()
                .then(() => res.status(201).json({ message: "Utilisateur créé !" })) // 201 Created
                .catch((error) => res.status(400).json({ error })); //400 Bad Request
        })
        .catch((error) => res.status(500).json({ error }));
};

//--Pour connecter un utilisateur dejà enregistré---
exports.login = (req, res, next) => {
    const emailCrypto = cryptoJs.HmacSHA256(req.body.email, process.env.PASSWORD_SECRET).toString();
    User.findOne({ email: emailCrypto })
        .then((user) => {
            if (user === null) {
                res.status(401) //401 Unauthorized
                    .json({ message: "Paire identifiant/mot de passe incorrecte" }); //le message doit être flou pour ne pas faire fuite de données(ne pas pouvoir verifier si l'utilisateur est enregistré ou pas de la part de l'utilisateur)
            } else {
                bcrypt
                    .compare(req.body.password, user.password) //fonction compare()de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données (Cela montre que même bcrypt ne peut pas décrypter ses propres hashs).
                    .then((valid) => {
                        if (!valid) {
                            res.status(401).json({
                                message: "Paire identifiant/mot de passe incorrecte",
                            });
                        } else {
                            res.status(200).json({
                                //envoie dans la response du serveur du userId et du token d'auth
                                // 200 ok
                                userId: user._id,
                                token: jwt.sign(
                                    //3 arguments
                                    { userId: user._id }, //playload: //encodage du userId pour la création du nouveau objet(objet et userId sernt liés)
                                    process.env.TOKEN_SECRET, //une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour crypter notre token (à remplacer par une chaîne aléatoire beaucoup plus longue pour la production)
                                    { expiresIn: "24h" } //chaque token est valable que 24h(Nous définissons la durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures.)
                                ),
                            });
                        }
                    })
                    .catch((error) => {
                        res.status(500).json({ error }); //500 Internal Server Error
                    });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};
