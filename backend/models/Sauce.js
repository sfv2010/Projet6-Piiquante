const mongoose = require("mongoose"); //on importe mongoose.

const sauceSchema = mongoose.Schema({
    //la fonction Schema() qui nous est mis à disposition par mongoose.
    // _id sera généré automatiquement par mangoDB. On a pas besoin d'ajouter.
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: [String], required: true },
    usersDisliked: { type: [String], required: true },
});

//ensuite, nous exportons ce schéma en tant que modèle Mongoose appelé « sauce »,
//le rendant par là même disponible pour notre application Express.
//pour lire et enregistrer dans la base de donées.
//La méthode  model()  transforme ce modèle en un modèle utilisable.
module.exports = mongoose.model("Sauce", sauceSchema);
