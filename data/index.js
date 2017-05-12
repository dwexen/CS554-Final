const taskRoutes = require("./pages");

let constructorMethod = (app) => {
    app.use("/pages", taskRoutes);
};

module.exports = {
    pages: require("./pages")
};