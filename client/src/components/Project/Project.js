import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Pool from "./Pool.js";
import { Grid } from "@material-ui/core";
import ButtonSizes from "../utils/FAB.js";
import SimpleModalWrapped from "../utils/Modal";
import AddTaskLayout from "../utils/AddTaskLayout.js";
import SprintSelect from './SprintSelect';
import UserPool from './UserPool';

class Project extends React.Component {

    state = {
        //this is the project's personal info
        projName: "",
        summary: "",
        projDueDate: "",
        projectId: "",

        inviteCode: "",

        tasks: [],
        projects: [],
        sprints: [],
        direction: 'column',
        justify: 'flex-start',
        alignItems: 'flex-start',

        // temp id set
        sprintId: 2,
        open: false,
        name: "",
        due_date: "",
        description: "",
        chipData: []
    }

    componentDidMount() {
        const { id } = this.props.match.params;
        axios.post("/api/projectById", {
            token: "project",
            id: id
        }).then((response) => {
            console.log(response.data);
            this.setState({
                projName: response.data[0].name,
                summary: response.data[0].summary,
                projDueDate: response.data[0].due_date,
                projectId: response.data[0].id
            });
            this.getTasks();
            //pass project id here
            this.getSprints(this.state.projectId);
        });
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        }, () => {
            console.log(this.state.due_date)
        });
    };

    getTasks = () => {

        // let number = this.state.projects
        // below we'll just place the variable in where we grab the dynamically updated 'project' that we're on depending on user choice
        axios.get("/api/task/" + this.state.sprintId).then((res) => {

            let task = res.data;
            let tasky = [];

            for (let i = 0; i < task.length; i++) {
                if (task[i].assigned_id === null) {
                    tasky.push(task[i])
                }
            }

            this.setState({
                tasks: tasky
            })
        });
    };

    addTask = (event) => {
        event.preventDefault();

        // would put sprintId state in as basis for task addition
        axios.post("/api/task", {
            name: this.state.name,
            due_date: this.state.due_date,
            description: this.state.description,
            sprint_id: this.state.sprintId
        }).then(() => {
            this.getTasks();
        });
    }

    handleOpen = () => {
        this.setState({
            open: true
        })
    }

    handleClose = () => {
        this.setState({ open: false });
    };

    deleteTask = (task) => {
        axios.delete("/api/task/by/" + task.id).then(() => {
            this.getTasks();
        });
    }

    assignTask = (task) => {
        axios.post("/api/decrypt", { token: localStorage.getItem("token"), id: sessionStorage.getItem("id") }).then((response) => {
            let user = response.data;

            console.log(user)
            axios.put("/api/task/by/" + task.id + "/" + user).then(() => {
                this.getTasks();
            })
        });
    }

    updateActiveSprint = (sprintId) => {
        this.setState({ sprintId: sprintId }, () => {
            this.getTasks();
        });
    }

    defaultVal = () => {
        let today = new Date().split("T");

        this.setState({
            due_date: today
        });
    };

    getSprints = projectId => {
      let sprintData = [];
      axios.get(`/api/sprint/${projectId}`)
      .then(res => {
          let today = new Date();
          res.data.map((pSprint, i) => {
              sprintData.push({
                  key: i,
                  label: pSprint.name,
                  id: pSprint.id
              })
          this.setState({ chipData: sprintData })
          })
        })
      };

      inviteMember = () => {
        //we'll pass the sprint id as an encrypted id
        axios.post("/api/encrypt",{
          id: this.state.sprintId.toString(),
          token: "invite"
        }).then((response)=>{
          console.log(response.data);
          this.setState({inviteCode: response.data});
        });
      }

    render() {
        const { direction, justify, alignItems } = this.state;
        return (
            <div style={{ paddingTop: "100px" }}>
                <SprintSelect pastSprints={this.state.chipData} onClick={this.updateActiveSprint} />
                <Grid container>
                    <h1>{this.state.projName}</h1>
                    <h2>{this.state.summary}</h2>
                    <h3>{this.state.projDueDate}</h3>
                    <Grid item xs={6} style={{ padding: "10px" }}>
                        <h2>This is pool.</h2>

                        <div>
                          {this.state.inviteCode}
                        </div>
                        <button onClick = {this.inviteMember}>Invite Code</button>

                        <Grid
                            container
                            alignItems={alignItems}
                            direction={direction}
                            justify={justify}
                        >
                            <ButtonSizes
                                onClick={this.handleOpen}
                            />
                            <SimpleModalWrapped
                                open={this.state.open}
                                onClose={this.handleClose}
                                name="Add a New Task ..."
                                onSubmit={this.addTask}
                                onChange={this.handleChange}
                            >
                                <AddTaskLayout
                                />
                            </SimpleModalWrapped>
                            {this.state.tasks.map((task) => {
                                return (
                                    <Pool
                                        key={task.id}
                                        id={this.key}
                                        tasks={task}
                                        onClickDelete={this.deleteTask.bind(this, task)}
                                        onClickAdd={this.assignTask.bind(this, task)}
                                    />
                                );
                            })}

                        </Grid>
                    </Grid>
                    <Grid item xs={6} style={{ padding: "10px" }}>
                        <UserPool sprintId={this.state.sprintId}></UserPool>
                    </Grid>
                    <br />
                    <div><Link to="/homepage">Back to home page.</Link></div>
                </Grid>
            </div>
        );
    }
}

export default Project;
