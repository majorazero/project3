var db = require('../models');
const encrypt = require("../helper/encrypt.js");
var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'mysql'
});

module.exports = function (app) {
    app.get("/api/user", (req, res) => {
        db.User.findAll({}).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    app.post("/api/userByDecrypt",(req,res) => {
      db.User.findAll({
        where:{
          id: encrypt.decrypt(req.body.token,req.body.id)
        }
      }).then((data) => {
        res.json(data[0]);
      });
    });

    app.get("/api/project", (req, res) => {
        db.Project.findAll({}).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    app.post("/api/projectOfUser", (req, res) => {
      let userId = encrypt.decrypt(req.body.token, req.body.id);
      db.Project.findAll(
        { where: { userId: userId } }
      ).then((data) => {
        db.sequelize.query(`SELECT DISTINCT Projects.name, Projects.id, Projects.due_date, Projects.complete, Projects.completed_date, Projects.summary, Projects.userId FROM Users INNER JOIN SprintMemberships ON SprintMemberships.userId = Users.id AND Users.id = ${userId} INNER JOIN Sprints ON Sprints.id = SprintMemberships.sprintId INNER JOIN Projects ON Sprints.project_id = Projects.id`, { type: sequelize.QueryTypes.SELECT }).then(dbSprintUser => {
          let aggregate = JSON.parse(JSON.stringify(data));
          console.log(aggregate);
          for (let i = 0; i < dbSprintUser.length; i++) {
            if (aggregate.length === 0) {
              aggregate.push(dbSprintUser[i]);
            }
            else {
              for (let j = 0; j < aggregate.length; j++) {
                if (dbSprintUser[i].id === aggregate[j].id) {
                  break;
                }
                if (j === aggregate.length - 1) {
                  aggregate.push(dbSprintUser[i]);
                }
              }
            }
          }
          let object = {};
          object.currentUser = userId;
          object.projects = aggregate;
          res.json(object);
        });
      });
    });

    app.post("/api/projectById", (req, res) => {
        db.Project.findAll({
            where: { id: encrypt.decrypt(req.body.token, req.body.id) }
        }).then((data) => {
            res.json(data);
        });
    });

    app.get("/api/sprint/:projectId", (req, res) => {
        db.Sprint.findAll({
            where: {
                project_id: req.params.projectId
            },
            order: [["end_date", "DESC"]]
        }).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    app.get("/api/task/:sprintId", (req, res) => {
        db.Task.findAll({
            where: {
                sprint_id: req.params.sprintId
            }
        }).then(dbSprint => {
            res.json(dbSprint);
        })
    });

    app.get("/api/tasks/users/:userId", (req, res) => {
        db.Task.findAll({
            where: {
                assigned_id: req.params.userId
            },
            order: [['sprint_id', 'DESC']]
        }).then(dbTasks => {
            res.json(dbTasks);
        })
    });

    app.post("/api/allMemberInSprint", (req,res) => {
      db.SprintMembership.findAll({
        where: {sprintId: req.body.sprintId},
        include: [{
          model: db.User,
          as: "User"
        }]
      }).then((data) => {
        res.json(data);
      })
    });

    app.post("/api/allSprintsForMember", (req, res) => {
        db.SprintMembership.findAll({
            where: { userId: req.body.userId },
            include: [{
                model: db.Sprint,
                as: "Sprint"
            }]
        }).then((data) => {
            res.json(data);
        })
    });

    app.post("/api/getuser/", (req, res) => {
      let Obj = {};
      let simpleId = encrypt.decrypt(req.body.token,req.body.id);
      db.User.findAll({
       where: {
        id: simpleId
       }
      }).then(response => {
        Obj.prof = response[0];
        //lets also pull some career data in here.
        db.Task.findAll({
          where: {
            assigned_id: simpleId
          }
        }).then((tRes) => {
          console.log("Tasks Response:",tRes);
          Obj.stacks = {};
          for(let i = 0; i < tRes.length; i++){
            if(Obj.stacks[tRes[i].stack] === undefined){
              if(tRes[i].isCompleted === true){
                Obj.stacks[tRes[i].stack] =
                {
                  amountAttempted: 1,
                  amountComplete: 1,
                  complexitySum: tRes[i].complexity
                };
              }
              else{
                Obj.stacks[tRes[i].stack] =
                {
                  amountComplete: 0,
                  complexitySum: 0,
                  amountAttempted: 1
                };
              }
            }
            else{
              if(tRes[i].isCompleted === true){
                Obj.stacks[tRes[i].stack].amountComplete++;
                Obj.stacks[tRes[i].stack].amountAttempted++;
                Obj.stacks[tRes[i].stack].complexitySum += tRes[i].complexity;
              }
              else{
                Obj.stacks[tRes[i].stack].amountAttempted++;
              }
            }
          }
          console.log("OBJECTYES",Obj.stacks);
          Obj.task = tRes;
          Obj.totalTask = tRes.length;
          Obj.totalCompletedTask = 0;
          //for complexity
          Obj.complexity = 0;
          for(let i = 0; i < tRes.length; i++){
            Obj.complexity += tRes[i].complexity;
            if(tRes[i].isCompleted === true){
              Obj.totalCompletedTask++;
            }
          }
          Obj.complexity = (Obj.complexity/tRes.length).toFixed(2);
          if(Obj.complexity <= 1.5){
            Obj.compSemantics = "Easy";
          }
          else if (Obj.complexity <= 2.5){
            Obj.compSemantics = "Easy-Medium";
          }
          else if (Obj.complexity <= 3.5){
            Obj.compSemantics = "Medium";
          }
          else if (Obj.complexity <= 4.5){
            Obj.compSemantics = "Medium-Hard";
          }
          else if (Obj.complexity <= 5){
            Obj.compSemantics = "Hard";
          }
          else{
            Obj.compSemantics = "Start doing some tasks, see where you at!";
            Obj.complexity = 0;
          }
          db.SprintMembership.findAll({
            where: {
              userId: simpleId
            },
            include:[{
              model: db.Sprint,
              as: "Sprint"
            }]
          }).then((spRes) => {
            Obj.sprintDat = spRes;
            Obj.sprintParticipate = spRes.length;
            Obj.projectContributed = 0;
            let projectCheckArr = [];
            for(let i = 0; i < spRes.length; i++){
              if(!projectCheckArr.includes(spRes[i].Sprint.project_id) === true){
                projectCheckArr.push(spRes[i].Sprint.project_id);
                Obj.projectContributed++;
              }
            }
            db.Project.findAll({
              where: {
                userId: simpleId
              }
            }).then((pRes) => {
              Obj.projectCreated = pRes.length;
              res.json(Obj);
            });
          });
        });
      })
    });

    app.get("/api/sprintById/:sprintId", (req, res) => {
        db.Sprint.findAll({
            where: {
                id: req.params.sprintId
            },
        }).then(dbSprint => {
            res.json(dbSprint);
        })
    });
}
