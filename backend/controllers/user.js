////---Configurez les routes d'authentification coté implémentation de la logique métier.

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); //Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token.

const User = require("../models/User");

exports.signup = (req, res, next) => {
  //pour connecter la premiere fois
  //La méthode  hash()  de bcrypt crée un hash crypté des mots de passe de vos utilisateurs pour les enregistrer de manière sécurisée dans la base de données.
  bcrypt
    .hash(req.body.password, 10) // (le mot de passe du corps de la rêquête qui sera pqssé pqr le frontend, le salt,c'est cobien de fois on execute l'algo de hashage (ici 10fois)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  //pour connecter cliens dejà enregistré
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({ message: "Paire identifiant/mot de passe incorrecte" });
            } else {
              res.status(200).json({
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
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
