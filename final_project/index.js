const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const public_routes = require('./router/general.js').public;
const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next){
    if (req.session && req.session.authorization) {
        const token = req.session.authorization.accessToken;
        jwt.verify(token, "pokemon", (err, decoded) => {
          if (err) {
            return res.status(403).json({ message: "Invalid token" });
          }
          req.users = decoded;
          next();
        });
      } 
      else {
        return res.status(403).json({ message: "User not logged in" });
      }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", public_routes);
app.use("/async", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
