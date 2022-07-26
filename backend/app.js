const express = require("express"); // Importer express expressのモジュールを読み込んでオン絵を受ける
//const rateLimit = require("express-rate-limit"); //L’ express-rate-limit est le package npm pour limiter la demande de l’utilisateur.

const app = express(); //Pour créer une application Express,on utilise la méthode express() express module を実体化してインスタンスにするコピーをする,という行為がインスタンス化

const mongoose = require("mongoose");

const sauceRoutes = require("./routes/sauce");

const userRoutes = require("./routes/user"); // importez le routeur pour enregistrons notre routeur dans notre application

const path = require("path"); //traiter les requêtes vers la route /image,

const helmet = require("helmet");
require("dotenv").config();

//--- Sécuriser les requêtes HTML---
app.use(helmet());

// const apiRequestLimiter = rateLimit({
//     windowMs: 1 * 60 * 1000, // 1 minute
//     max: 2, // limit each IP to 2 requests per windowMs
//     message: "Trop de requêtes de cette IP",
// });
// app.use(apiRequestLimiter);
//--- Connecter mangooDB---
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

// Pour gérer la requête POST venant de l'application front-end, on a besoin d'en extraire le corps JSON.
app.use(express.json());

//--- CORS---
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "same-site"); //pour afficher les images en utilisant helmet
    res.setHeader("Access-Control-Allow-Origin", "*"); // d'accéder à notre API depuis n'importe quelle origine ( '*' ) ;
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    ); //d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"); //d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
    next(); // n'oublie pas de passer next
});

//---Route---
app.use("/images", express.static(path.join(__dirname, "images"))); //le gestionnaire de routage
app.use("/api/sauces", sauceRoutes); // rajouter un premiere argument sous forme de chane de caractere
// //qui sera l'URL visée par l'application = Endpoint ou route sur notre API
// // url total sera = http//localhost:3000/api/sauces
app.use("/api/auth", userRoutes); //enregistrez-le notre routeur dans notre application :

module.exports = app; // exporter cette application pour qu'on puisse y acceder depuis les autres fichiers de notre projet
