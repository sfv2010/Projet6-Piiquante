//---La logique de routing---

//---Importation---

const express = require("express");
const router = express.Router(); //methode express.Router()permet de créer des routeurs séparés pour chaque route principale de notre application

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config"); // faut placer multer après auth sinon même les images des requêtes non authentifiées seront enregistrées dans le serveur.

const sauceCtrl = require("../controllers/sauce");

//---Router---

//---Route pour créer un objet ---
router.post("/", auth, multer, sauceCtrl.createSauce);
//---Route pour modifier un objet ---
router.put("/:id", auth, multer, sauceCtrl.modifySauce); //Le :(deux-points) ici dit à Express que cette partie de la route est dynamique  pour la rendre accessible en tant que paramètre
//---Route pour supprimer un objet---
router.delete("/:id", auth, multer, sauceCtrl.deleteSauce);
//---Route pour afficher un seul objet dans la base de donées par son id
router.get("/:id", auth, sauceCtrl.getOneSauce);
//---Route pour afficher tous les objets Sauce qui sont dans la base de donées
router.get("/", auth, sauceCtrl.getAllSauce);
//---Route pour lliker ou disliker
router.post("/:id/like", auth, sauceCtrl.likeOrDislikeSauce);

//---Exportation---
module.exports = router;
