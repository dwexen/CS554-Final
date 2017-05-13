const pageRoutes = require("./pages");

const constructorMethod = (app) => {
    app.use("/", pageRoutes);

    app.use("*", (req, res) => {
        res.redirect("/");
    })
};

module.exports = constructorMethod;