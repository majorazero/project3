const encrpyt = require("../helper/encrpyt.js");


module.exports = (app) => {
  app.post("/api/login",(req,res) => {
    let token = encrpyt.encrpyt(req.body.username,req.body.password);
    //the token will also get saved to the user database
    //if login checks out we'll return a token to the client as well as an encrypted userId for now i'm setting it to 1
    res.json({
      token: token,
      id: encrpyt.encrpyt(req.body.username,"1")
    });
  });

  app.post("/api/register",(req,res) => {
    console.log(req.body);
    //register would check if user exists, an if they do, they'll res.json back with a already exist, otherwise we create the user, probably make a token for them along the way... actually if that's the case we probably don't need the token failsafe in the login post but we'll keep it there for now.s
    res.json("GOT IT");
  });
};
