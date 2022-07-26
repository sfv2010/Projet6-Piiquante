////---Configurez les routes d'authentification coté implémentation de la logique métier.

const bcrypt = require("bcrypt");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken"); //Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token.
const User = require("../models/User");
//const passwordValidator = require("password-validator");

exports.signup = (req, res, next) => {
    //Pour crypter des emails
    const emailCrypto = cryptoJs.HmacSHA256(req.body.email, "KEY_SECRET").toString();
    //La méthode  hash()  de bcrypt crée un hash crypté des mots de passe de vos utilisateurs pour les enregistrer de manière sécurisée dans la base de données.
    bcrypt
        .hash(req.body.password, 10) // (le mot de passe du corps de la rêquête qui sera pqssé par le frontend, le salt,c'est cobien de fois on execute l'algo de hashage (ici 10fois)
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

exports.login = (req, res, next) => {
    const emailCrypto = cryptoJs.HmacSHA256(req.body.email, "KEY_SECRET").toString();
    //pour connecter cliens dejà enregistré
    User.findOne({ email: emailCrypto })
        .then((user) => {
            if (user === null) {
                res.status(401) //401 Unauthorized
                    .json({ message: "Paire identifiant/mot de passe incorrecte" });
            } else {
                bcrypt
                    .compare(req.body.password, user.password)
                    .then((valid) => {
                        if (!valid) {
                            res.status(401).json({
                                message: "Paire identifiant/mot de passe incorrecte",
                            });
                        } else {
                            res.status(200).json({
                                // 200 ok
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    "RANDOM_TOKEN_SECRET", //une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour crypter notre token (à remplacer par une chaîne aléatoire beaucoup plus longue pour la production)
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
