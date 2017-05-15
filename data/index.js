const pageRoutes = require("./pages");
const userRoute = require("./users");
let constructorMethod = (app) => {
    app.use("/pages", pageRoutes);
    app.use("/users", userRoute);
};

module.exports = {
    pages: require("./pages"),
    users: require("./users")
};