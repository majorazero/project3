var db = require('../models');
const encrpyt = require("../helper/encrpyt.js");
var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'mysql'
});


module.exports = function(app) {
    app.get("/api/user", (req, res) => {
        db.User.findAll({}).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    app.post("/api/user", function(req, res) {
        db.User.create(req.body)
          .then(function(dbUser) {
            res.json(dbUser);
          });
      });

    app.get("/api/project", (req, res) => {
        db.Project.findAll({}).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    app.post("/api/project", function(req, res) {
    db.Project.create(req.body)
        .then(function(dbProject) {
        res.json(dbProject);
        });
    });

    //returns sprints associated with a given project
    app.get("/api/sprint/:projectId", (req, res) => {
        db.Sprint.findAll({
            where: {
                project_id:req.params.projectId
            }
        }).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    app.post("/api/sprint", function(req, res) {
        db.Sprint.create(req.body)
            .then(function(dbSprint) {
            res.json(dbSprint);
        });
    });

    // returns all tasks for a given sprint
    app.get("/api/task/:sprintId", (req, res) => {
        db.Task.findAll({
            where: {
                sprint_id: req.params.sprintId
            }
        }).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    
    
    app.post("/api/task", function(req, res) {
        db.Task.create(req.body)
            .then(function(dbTask) {
            res.json(dbTask);
        });
    });

    //all tasks for a given user
    app.get("/api/tasks/users/:userId", (req, res) => {
        db.Task.findAll({
            where: {
                assigned_id: req.params.userId
            }
        }).then(dbTasks => {
            res.json(dbTasks);
        })
    });

    // returns all users for a given project
    app.get('/api/users/project/:projectId', (req, res)=> {
        db.sequelize.query(`SELECT users.email as user_email, projects.name as project, sprints.name FROM users INNER JOIN tasks ON tasks.assigned_id = users.id INNER JOIN sprints ON sprints.id = tasks.sprint_id INNER JOIN projects on projects.id = sprints.project_id AND projects.id=${req.params.projectId}`, { type: sequelize.QueryTypes.SELECT}).then(dbProjectUsers => {
            res.json(dbProjectUsers)
        })
    });

    //returns all users for a given sprint
    app.get('/api/users/sprint/:sprintId', (req, res)=> {
        db.sequelize.query(`SELECT users.email as user_email, sprints.name FROM users INNER JOIN tasks ON tasks.assigned_id = users.id INNER JOIN sprints ON sprints.id = tasks.sprint_id AND sprints.id=${req.params.sprintId}`, { type: sequelize.QueryTypes.SELECT}).then(dbSprintUser => {
            res.json(dbSprintUser)
        })
    });
    
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