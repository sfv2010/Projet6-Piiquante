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
  const emailCrypto = cryptoJs
    .HmacSHA256(req.body.email, process.env.PASSWORD_SECRET)
    .toString();
  //La méthode hash() de bcrypt crée un hash crypté des mots de passe de nos utilisateurs pour les enregistrer de manière sécurisée dans la base de données.
  bcrypt
    .hash(req.body.password, 10) // (le mot de passe du corps de la rêquête qui sera passé par le frontend, le salt,c'est combien de fois on execute l'algo de hashage (ici 10fois)
    .then((hash) => {
      //récupérer le hash de mot de passe, et enregistrer dans un nouveau user qu'on va enregistrer dans la base de données.
      // créer ce nouvel utilisateur avec notre modèle Mongoose
      const user = new User({
        //on va enregistrer l'email crypté et le mot de passe crypté pour ne pas stocker l'email et le mot de passe en blanc
        email: emailCrypto,
        password: hash,
      });
      user
        .save() // enregistrer dans la base de donées
        .then(() => res.status(201).json({ message: "Utilisateur créé !" })) // 201 Created
        .catch((error) => res.status(400).json({ error })); //400 Bad Request
    })
    .catch((error) => res.status(500).json({ error }));
};

//--Pour connecter un utilisateur dejà enregistré---
exports.login = (req, res, next) => {
  const emailCrypto = cryptoJs
    .HmacSHA256(req.body.email, process.env.PASSWORD_SECRET)
    .toString();
  User.findOne({ email: emailCrypto })
    .then((user) => {
      // si l'utilisateur  n'existe pas
      if (user === null) {
        return res
          .status(401) //401 Unauthorized
          .json({ message: "Paire identifiant/mot de passe incorrecte" }); //le message doit être flou pour ne pas faire fuite de données(ne pas pouvoir verifier si l'utilisateur est enregistré ou pas de la part de l'utilisateur)
      }
      //si l'utilisateur  existe
      bcrypt
        .compare(req.body.password, user.password) //fonction compare()de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données (Cela montre que même bcrypt ne peut pas décrypter ses propres hashs).
        .then((valid) => {
          //si le mot de passe n'est pas correct
          if (!valid) {
            return res.status(401).json({
              message: "Paire identifiant/mot de passe incorrecte",
            });
          }
          // si le mot de passe est correct
          res.status(200).json({
            //renvoyer une réponse 200 avec le userId et le token d'auth.
            userId: user._id,
            //la fonction sign de jwt pour chiffrer un nouveau token.
            token: jwt.sign(
              { userId: user._id }, // l'ID de utilisateur   en tant que payload (les données encodées dans le token).
              process.env.TOKEN_SECRET, //Clé secrète pour l'encodage
              { expiresIn: "24h" } //chaque token est valable que 24h(Nous définissons la durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures.)
            ),
          });
        })
        .catch((error) => {
          res.status(500).json({ error }); //500 Internal Server Error
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
