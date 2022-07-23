//---Configurez les contrôleurs---
const Sauce = require("../models/Sauce"); //importer 輸入 取り込む
const fs = require("fs"); //fs signifie file system qui donne accès aux fonctions qui permettent de modifier le système de fichiers, y compris aux fonctions permettant de supprimer les fichiers.

//Création d'une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); // convertir sous format JSON car le front-end envoie les données de la requête sous la forme form-data
    delete sauceObject._id; // id d'objet va être générée automatiquement par notre bd
    delete sauceObject._userId; //supprimer le champ_userId de la requête envoyée par le client car nous ne devons pas lui faire confiance
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId, //le remplaçons en base de données par le _userId extrait du token par le middleware d’authentification.
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, //On a besoin de "req.protocol" et "req.get('host')", connectés par  '://'  et suivis de req.file.filename, pour reconstruire l'URL complète du fichier enregistré.
    });

    sauce
        .save()
        .then(() => {
            res.status(201).json({ message: "Sauce enregistré !" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file // verifier si l'utilisateur a mis à jour l'image ou pas
        ? {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
          }
        : { ...req.body };

    delete sauceObject._userId; //on supprime pour la sécurité
    Sauce.findOne({ _id: req.params.id }) //Verifier si la personne demandant la modification de l’objet est la propriétaire de celui-ci.
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: "Non-autorisé" });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce modifié!" }))
                    .catch((error) => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) //vérifier si l’utilisateur qui a fait la requête de suppression est bien celui qui a créé le Sauce
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: "Non-autorisé" });
            } else {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    //la fonction unlink du package fs pour supprimer ce fichier, en lui passant le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé.
                    Sauce.deleteOne({ _id: req.params.id })
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

//Récupérer toutes les sauces
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error }));
};

// Récupérer une seule sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};

//J'aime ou je n'aime pas la sauce
// exports.likeOrDislikeSauce = (req, res) => {
//   if(){

//   }

// }
