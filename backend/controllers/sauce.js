//---Configurez les contrôleurs---

//---Importation---

const Sauce = require("../models/Sauce");
const fs = require("fs"); //fs signifie file system qui donne accès aux fonctions qui permettent de modifier et supprimer le fichiers.

//---Logique métier---

//---Création d'une sauce---
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //convertir sous format JSON car le front-end envoie sous la forme form-data.
  delete sauceObject._id; // supprimer _id d'objet car il va être générée automatiquement par notre mongoDB
  delete sauceObject.userId; //supprimer le champ userId de la requête envoyée par le client car nous ne devons pas lui faire confiance
  const sauce = new Sauce({
    //déclaration de sauce : une nouvelle instance du modele Sauce
    ...sauceObject, //L'opérateur spread pour faire une copie de tous les éléments de req.body
    userId: req.auth.userId, //le remplaçons en base de données par le userId extrait du token par le middleware d’authentification.
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, //Pour reconstruire l'URL complète du fichier enregistré.(on a besoin de "req.protocol" et "req.get('host')", connectés par '://' et suivis de req.file.filename.)
  });

  sauce
    .save() // La méthode save() qui enregistre notre Sauce dans la base de données et renvoie une Promise.
    .then(() => {
      //(même si tout se passe bien)il faut envoyer une réonse à la frontend ,sinon on aura l'expiration de la requête .
      res.status(201).json({ message: "Sauce enregistré !" }); // Envoyer ces articles sous la forme de données JSON, avec un code 201 pour une demande réussie et une nouvelle ressource a été créée.
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

//---Modifier une sauce---
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file // verifier si l'utilisateur a mis à jour l'image ou pas
    ? {
        ...JSON.parse(req.body.sauce), // si oui, reconstruire l'URL complète du fichier enregistré
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }; //sinon on laisse

  Sauce.findOne({ _id: req.params.id }) // La méthode findOne() dans notre modèle Sauce pour trouver un seul Sauce ayant le même _id que le paramètre de la requête ;
    .then((sauce) => {
      //Verifier si la personne demandant la modification de l’objet est la propriétaire de celui-ci.
      if (sauce.userId !== req.auth.userId) {
        //si userId ne correspond pas celui de userId extrait du token par le middleware d’authentification.
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        //La méthode updateOne()permet de modifier le Sauce que l'on passe comme premier argument,
        // et le remplace par le nouvel Sauce passé comme second argument avec l'id correspond à celui des paramètres pour être sûr que çq sera même.
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

//---Supprimer une sauce : suppression d'une sauce de base de donées, le fichier image correspondant aussi doit être supprimé---
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //trouver la Sauce ayant le même _id que le paramètre de la requête
    .then((sauce) => {
      //vérifier si l’utilisateur qui a fait la requête de suppression est bien celui qui a créé le Sauce, sinon
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1]; // split() : récupére le nom de ficher autour du répertoire images
        fs.unlink(`images/${filename}`, () => {
          //la fn unlink du package fs pour supprimer ce fichier, en lui passant le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé.
          Sauce.deleteOne({ _id: req.params.id }) // après surpprimer l'image,on supprime l'enregistrement de base de donées.
            .then(() => {
              res.status(200).json({ message: "Sauce supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//---Récupérer toutes les sauces---
exports.getAllSauce = (req, res, next) => {
  Sauce.find() //pas besoin d'argument,car ici on veut la liste complète de Sauce
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//---Récupérer une seule sauce---
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//---Like ou dislike ou aucun des deux---
exports.likeOrDislikeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    // Si like = 1 : l'utilisateur aime la sauce et il n'a pas déjà liké(l'userId n'est pas déjà présent dans le tableau de userLiked)
    //La méthode includes() permet de déterminer si un tableau contient une valeur et renvoie true ou false.
    if (req.body.like === 1 && !sauce.usersLiked.includes(req.body.userId)) {
      return Sauce.updateOne(
        //mise à jour de base de donées
        { _id: req.params.id }, //la Sauce ayant le même _id que le paramètre de la requête
        { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } } //l'opérateur de MongoDB :$inc incrémente un champ d'une valeur .
        //L'opérateur $push ajoute une valeur spécifiée à un tableau. il faut mettre d'abord $inc.
      )
        .then(() => res.status(200).json({ message: "J'aime!" }))
        .catch((error) => res.status(400).json({ error }));
    }
    // Si like = -1 : l'utilisateur n'aime pas la sauce
    if (
      req.body.like === -1 &&
      !sauce.usersDisliked.includes(req.body.userId)
    ) {
      return Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
      )
        .then(() => res.status(200).json({ message: "Je n'aime pas!" }))
        .catch((error) => res.status(400).json({ error }));
    }
    // Si like = 0 : l'utilisateur annule son like ou dislike
    if (req.body.like === 0)
      if (sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } } //$pull supprime d'un tableau existant une ou des valeurs correspondant
        )
          .then(() => res.status(200).json({ message: "like annulé !" }))
          .catch((error) => res.status(400).json({ error }));
      } else if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(200).json({ message: "dislike annulé !" }))
          .catch((error) => res.status(400).json({ error }));
      }
  });
};
