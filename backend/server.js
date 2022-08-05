//---importation---
const http = require("http"); // importer le package HTTP de Node.js pour créer un serveur.
const app = require("./app"); // importer le app.js qui est dans le meme dossier
const server = http.createServer(app); //on va passer cette application app à notre server

//---Garde-corps de sécurité---
//la fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne---
const normalizePort = (val) => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port); // indiquer à application express ,sur quelle port elle va tourner

//---Gestion d'erreur---
//la fonction errorHandler recherche les différentes erreurs et les gère de manière appropriée. Elle est ensuite enregistrée dans le serveur---
const errorHandler = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === "string" ? "pipe " + address : "port: " + port;
    switch (error.code) {
        case "EACCES": // EACCES: autorisation refusée
            console.error(bind + " requires elevated privileges.");
            process.exit(1); // process.exit(1): mettre fin au processus avec un échec. process.exit(0): fin sans échec
            break;
        case "EADDRINUSE": //EADDRINUSE: l'adresse cherchée est en cour d'utilisation
            console.error(bind + " is already in use.");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

server.on("error", errorHandler);
server.on("listening", () => {
    const address = server.address();
    const bind = typeof address === "string" ? "pipe " + address : "port " + port;
    console.log("Listening on " + bind);
});

//---configuration le serveur pour qu'il écoute les requêtes sur le port ---
server.listen(port);
