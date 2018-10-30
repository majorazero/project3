var db = require('../models');
const encrypt = require("../helper/encrypt.js");
var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'mysql'
});

module.exports = function(app){
    app.get('/api/users/project/:projectId', (req, res)=> {
        db.sequelize.query(`SELECT DISTINCT users.email as user_email, users.id AS user_id, projects.name as project, sprints.name AS sprint FROM users INNER JOIN tasks ON tasks.assigned_id = users.id INNER JOIN sprints ON sprints.id = tasks.sprint_id INNER JOIN projects on projects.id = sprints.project_id AND projects.id=${req.params.projectId}`, { type: sequelize.QueryTypes.SELECT}).then(dbProjectUsers => {
            res.json(dbProjectUsers)
        })
    });

    app.get('/api/users/sprint/:sprintId', (req, res)=> {
        db.sequelize.query(`SELECT DISTINCT users.email as user_email, users.id AS user_id, sprints.name AS sprint FROM users INNER JOIN tasks ON tasks.assigned_id = users.id INNER JOIN sprints ON sprints.id = tasks.sprint_id AND sprints.id=${req.params.sprintId}`, { type: sequelize.QueryTypes.SELECT}).then(dbSprintUser => {
            res.json(dbSprintUser)
        })
    });

    app.get('/api/projects/user/:userId', (req, res)=> {
      db.sequelize.query(`SELECT DISTINCT projects.name as project, projects.id, projects.due_date, projects.complete, projects.completed_date, projects.summary, projects.userId FROM users INNER JOIN sprintmemberships ON sprintmemberships.userId = users.id AND users.id = ${req.params.userId}INNER JOIN sprints ON sprints.id = sprintmemberships.sprintId INNER JOIN projects ON sprints.project_id = projects.id`, { type: sequelize.QueryTypes.SELECT}).then(dbSprintUser => {
          res.json(dbSprintUser)
      })
  });

      app.post("/api/login",(req,res) => {
        //find if user exists by mail
        db.User.findOne({where: {email:req.body.email}}).then((userRes) => {
          //if user does not exist
          if(userRes === null){
            res.json("User does not exist.");
          }
          else{
            //we password check.
            if(userRes.password !== req.body.password){
              res.json("Wrong password!");
            }
            else{
              res.json({
                token: userRes.token,
                id: encrypt.encrypt(userRes.token,userRes.id.toString())
              });
            }
          }
        })
    });

    app.post("/api/tokenLogin",(req,res) => {
      db.User.findOne({where: {token:req.body.token}}).then((userRes) => {
        if(userRes === null){
          res.json("No matching token found.");
        }
        else{
          res.json({
            id: encrypt.encrypt(userRes.token,userRes.id.toString())
          });
        }
      });
    });

      app.post("/api/register",(req,res) => {
        console.log(req.body);
        db.User.findOne({where:{email:req.body.email}}).then((userRes) => {
          if(userRes === null){
            db.User.create({
              first_name: req.body.fName,
              last_name: req.body.lName,
              email: req.body.email,
              password: req.body.password,
              token: encrypt.encrypt(req.body.email,req.body.password)
            }).then((data) => {
              let sessionId = encrypt.encrypt(data.token,data.id.toString());
              res.json({
                id: sessionId,
                token: data.token
              });
            });
          }
          else {
            res.json("User already exists!");
          }
        });
      });

      app.post("/api/encrypt",(req,res) => {
        res.json(encrypt.encrypt(req.body.token,req.body.id));
      })

      app.post("/api/decrypt",(req,res) => {
        res.json(encrypt.decrypt(req.body.token,req.body.id));
      });
}