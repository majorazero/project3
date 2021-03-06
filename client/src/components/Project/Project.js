import React from "react";
import axios from "axios";
import Pool from "./Pool.js";
import SimpleModalWrapped from "../utils/Modal";
import UserPool from './UserPool';
import ButtonAppBar from "../utils/Navbar/Navbar.js";
import AddSprintLayout from "../utils/AddSprintLayout.js";
import SimpleModalSprintWrapped from '../utils/ModalSprint';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Summary from "./Summary/Summary.js";
import LinearDeterminate from "../utils/ProgressBar/ProgressBar.js";
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ClippedDrawer from './../utils/Navbar/SprintDrawer.js';
import Tab from './../utils/Tab.js';
import Add from '@material-ui/icons/Add';
import { ListItemText, Typography } from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AlertSnackbar from './../utils/Snackbar';
import SimplePopper from './../utils/popovertext';

const styles = {
  root: {
    padding: '0px 30px 0px 10px'
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  }
}

class Project extends React.Component {
  state = {
    //this is the project's personal info
    projName: "",
    summary: "",
    projDueDate: "",
    projectId: "",
    adminId: "",
    isAdmin: "",

    inviteCode: "",

    isActive: true,
    activeSprintId: '',
    futureSprint: false,

    unassignedTasks: [],
    assignedTasks: [],
    completedTasks: [],
    projects: [],
    sprints: [],
    members: [],
    direction: 'column',
    justify: 'flex-start',
    alignItems: 'flex-start',

    // temp id set
    sprintId: -1,

    taskOpen: false,
    taskName: "",
    taskDue_date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
    taskDescription: "",
    taskComplexity: -1,
    taskStack: "",
    errorTaskMess: "",
    errorTaskCode: -1,
    chipData: [],
    showsnack: false,
    snackType: '',

    sprintOpen: false,
    sprintName: "",
    sprintStart_date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
    sprintEnd_date: "",

    currentUser: '',
    showComplete: false,

    //Progress Bar Time
    SprintTime: 0,
    SprintProgress: 0,

    //editing tasks
    editTaskOpen: false,
    currentTaskId: '',
    currentTaskName: '',
    currentTaskDueDate: '',
    currentTaskDescription: '',
    currentTaskComplexity: '',
    currentTaskStack: '',

    countdown: "",

    expanded: null //handles the accordion function for expansion panels
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    axios.post("/api/projectById", {
      token: "project",
      id: id
    }).then((response) => {
      this.setState({
        projName: response.data[0].name,
        summary: response.data[0].summary,
        projDueDate: response.data[0].due_date,
        projectId: response.data[0].id,
        adminId: response.data[0].userId
      });

      //pass project id here
      this.getCurrentUserId();
    }).catch((err) => {
      window.location.assign("/404");
    });
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  getTasks = () => {
    // let number = this.state.projects
    // below we'll just place the variable in where we grab the dynamically updated 'project' that we're on depending on user choice
    axios.get("/api/task/" + this.state.sprintId).then((res) => {
      let task = res.data;
      let unassigned = [];
      let assigned = [];
      let completed = [];

      for (let i = 0; i < task.length; i++) {
        if (task[i].assigned_id === null) {
          unassigned.push(task[i])
        }

        else if (!task[i].isCompleted) {
          assigned.push(task[i]);
        }
        else if (task[i].isCompleted) {
          completed.push(task[i])
        }
      }
      let progressStat = (completed.length / (completed.length + assigned.length + unassigned.length) * 100);
      if (completed.length + assigned.length + unassigned.length === 0) {
        progressStat = 0;
      }
      this.setState({
        unassignedTasks: unassigned,
        assignedTasks: assigned,
        completedTasks: completed,
        SprintProgress: progressStat
      });
    });
  };

  addTask = () => {
    if (this.state.taskName === "") {
      this.setState({ showsnack: true, snackType: 'error', errorTaskMess: 'Task needs a name!' });
      setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
    }
    else if (this.state.taskDescription === "") {
      this.setState({ showsnack: true, snackType: 'error', errorTaskMess: 'Task needs a description!' });
      setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
    }
    else if (this.state.taskComplexity > 5 || this.state.taskComplexity < 1) {
      this.setState({ showsnack: true, snackType: 'error', errorTaskMess: 'Invalid complexity value!' });
      setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
    }
    else if (this.state.taskStack === "") {
      this.setState({ showsnack: true, snackType: 'error', errorTaskMess: 'Input a stack requirement!' });
      setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
    }
    else {
      console.log("Task Added!");
      axios.post("/api/task", {
        name: this.state.taskName,
        due_date: this.state.taskDue_date,
        description: this.state.taskDescription,
        sprint_id: this.state.sprintId,
        complexity: this.state.taskComplexity,
        stack: this.state.taskStack
      }).then(() => {
        this.setState({
          taskOpen: false
        });
        this.getTasks();
      });
    }
  }

  editTask = (id) => {
    axios.put(`/api/edit/task/${id}`, {
      name: this.state.currentTaskName,
      due_date: this.state.currentTaskDueDate,
      description: this.state.currentTaskDescription,
      complexity: this.state.currentTaskComplexity,
      stack: this.state.currentTaskStack
    }).then(() => {
      this.getTasks();
      this.setState({
        editTaskOpen: false
      })
    })
  }

  handleOpen = (name, taskId, taskName, description, due_date, complexity, stack) => {
    this.setState({
      currentTaskId: taskId,
      currentTaskName: taskName,
      currentTaskDescription: description,
      currentTaskDueDate: due_date,
      currentTaskComplexity: complexity,
      currentTaskStack: stack,
      [name]: true
    })
  }

  handleClose = (name) => {
    this.setState({ [name]: false });
  };

  deleteTask = (task) => {
    axios.delete("/api/task/by/" + task.id).then(() => {
      this.getTasks();
    });
  }

  assignTask = (task) => {
    axios.post("/api/decrypt", { token: localStorage.getItem("token"), id: sessionStorage.getItem("id") }).then((response) => {
      let user = response.data;
      axios.put("/api/task/by/" + task.id + "/" + user).then((res) => {
        this.setState({ showsnack: true, snackType: 'success', errorTaskMess: 'Successfully claimed task!' });
        setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
        this.getTasks();
      })
    });
  }

  unassignTask = (id) => {
    axios.put("/api/task/unassign", { id: id }).then((response) => {
      this.setState({ showsnack: true, snackType: 'success', errorTaskMess: 'Successfully unassigned task!' });
      setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
      this.getTasks();
    });
  }

  updateActiveSprint = (sprintId) => {
    let currentSprint;
    let futureSprint = false;
    for (let i = 0; i < this.state.sprints.length; i++) {
      if (this.state.sprints[i].sprintId === sprintId) {
        currentSprint = this.state.sprints[i];
      }
    }
    let isActive = false;
    let endDate = new Date(`${currentSprint.endDate}T23:59:59`);
    let startDate = new Date(`${currentSprint.startDate}T00:00:00`);
    let today = new Date();
    let currentDate = new Date();
    let timeProgress = ((currentDate - startDate) / (endDate - startDate) * 100);

    let countdown = `${Math.ceil(((endDate - startDate) * (1 - (timeProgress / 100))) / (1000 * 60 * 60 * 24))} Days Left`;


    if (this.state.activeSprintId === sprintId) {
      isActive = true;
    }
    else if (startDate > today) {
      futureSprint = true;
    }

    if (timeProgress < 0) {
      timeProgress = 0;
      countdown = "(Not yet started)";
    }
    else if (timeProgress > 100) {
      timeProgress = 100;
      countdown = "(Sprint Ended)";
    }
    this.setState({ countdown: countdown, sprintId: sprintId, isActive: isActive, SprintTime: timeProgress, futureSprint: futureSprint }, () => {
      this.getTasks();
      this.getMembers(this.state.sprintId);
    });
  }

  defaultVal = () => {
    let today = new Date().split("T");
    this.setState({
      due_date: today
    });
  };

  getSprints = (projectId, userId) => {
    let sprintData = [];
    axios.get(`/api/sprints/project/${projectId}/user/${userId}`).then((res) => {
      if (res.data.length > 0) {
        let sprints = res.data
        let today = new Date();
        let currentSprint = res.data[0].sprintId;
        let activeSprint;
        let isActive = false;
        let timeProgress = 0;
        let countdown = this.state.countdown;
        // check for active sprint
        for (let i = 0; i < sprints.length; i++) {
          let endDate = new Date(`${sprints[i].endDate}T23:59:59`)
          let startDate = new Date(`${sprints[i].startDate}T00:00:00`)
          let currentDate = new Date();
          sprintData.push({
            key: i,
            label: sprints[i].sprintName,
            id: sprints[i].sprintId,
            start: `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`,
            end: `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`
          });
          if (sprints[i].isActive) {
            //verify end date has not passed
            if (today > endDate) {
              //console.log("hit me");
              //isActive = false;
            }
            else {
              //set currentSprint, set isActive
              activeSprint = sprints[i].sprintId;
              currentSprint = activeSprint
              isActive = true;
              timeProgress = ((currentDate - startDate) / (endDate - startDate) * 100);
              countdown = `${Math.ceil(((endDate - startDate) * (1 - (timeProgress / 100))) / (1000 * 60 * 60 * 24))} Days Left`;
            }
          }
          else if (today >= startDate && today <= endDate) {
            activeSprint = sprints[i].sprintId;
            currentSprint = activeSprint
            isActive = true;
            timeProgress = ((currentDate - startDate) / (endDate - startDate) * 100);
            countdown = `${Math.ceil(((endDate - startDate) * (1 - (timeProgress / 100))) / (1000 * 60 * 60 * 24))} Days Left`;
          }
        }
        this.setState({
          countdown: countdown,
          SprintTime: timeProgress,
          chipData: sprintData,
          sprintId: currentSprint,
          activeSprintId: activeSprint,
          sprints: res.data,
          isActive: isActive
        }, () => console.log(this.state.sprints));
      }
    }).then(() => {
      this.getTasks();
      this.getMembers(this.state.sprintId);
    });
  };

  addSprint = () => {
    let overlap = false;
    let overlappingSprint;
    let newSprintStart = new Date(`${this.state.sprintStart_date}T00:00:00`);
    console.log(this.state.sprintStart_date)

    for (let i = 0; i < this.state.sprints.length; i++) {
      let start = new Date(`${this.state.sprints[i].startDate}T00:00:00`)
      console.log(this.state.sprints[i].startDate)
      let end = new Date(`${this.state.sprints[i].endDate}T23:59:59`)
      if (newSprintStart >= start && newSprintStart <= end) {
        overlap = true
        overlappingSprint = this.state.sprints[i].sprintName
      }
    }
    if (this.state.sprintName === '') {
      this.setState({ showsnack: true, snackType: 'error', errorTaskMess: `Please include a sprint name.` });
      setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
    }
    else if (overlap === true) {
      this.setState({ showsnack: true, snackType: 'error', errorTaskMess: `${overlappingSprint} overlaps with this! Fix your dates!` });
      setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
      // console.log(`${overlappingSprint} overlaps with this! Fix your dates!`)
    }
    else {
      axios.post('/api/sprint', {
        name: this.state.sprintName,
        start_date: this.state.sprintStart_date,
        end_date: this.state.sprintEnd_date,
        project_id: this.state.projectId
      }).then((res) => {
        axios.post(`/api/sprintMembership`, { userId: this.state.currentUser, sprintId: res.data.id })
          .then(() => {
            this.setState({
              sprintOpen: false
            }, () => {
              this.getSprints(this.state.projectId, this.state.currentUser);
            });
          })
      });
    }
  }

  getMembers = (sprintId) => {
    axios.post('/api/allMemberInSprint', { sprintId: sprintId }).then(res => {
      this.setState({ members: res.data });
    })
  }

  getCurrentUserId = () => {
    axios.post("/api/userByDecrypt", {
      id: sessionStorage.getItem("id"),
      token: localStorage.getItem("token")
    }).then(res => {
      let isAdmin = false;
      if (res.data.id === this.state.adminId) {
        isAdmin = true;
      }
      this.setState({ currentUser: res.data.id, isAdmin: isAdmin },
        () => {
          this.getSprints(this.state.projectId, this.state.currentUser)
        }
      );
    });
  }


  inviteMember = () => {
    //we'll pass the sprint id as an encrypted id
    axios.post("/api/encrypt", {
      id: this.state.sprintId.toString(),
      token: "invite"
    }).then((response) => {
      this.setState({ inviteCode: response.data });
    });
  }

  markComplete = (id) => {
    axios.put(`/api/complete/task/${id}`)
      .then(() => {
        this.setState({ showsnack: true, snackType: 'success', errorTaskMess: 'Successfully completed task!' });
        setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
        this.getTasks();
      }
      )
  }

  reopenTask = (id) => {
    axios.put(`/api/reopen/task/${id}`)
      .then(() => {
        this.setState({ showsnack: true, snackType: 'success', errorTaskMess: 'Reopened task!' });
        setTimeout(() => { this.setState({ showsnack: false }) }, 3000);
        this.getTasks();
      }
      )
  }

  switchTaskPool = () => {
    if (this.state.showComplete === true) {
      this.setState({ showComplete: false })
    }
    else {
      this.setState({ showComplete: true })
    }
  }

  handleTaskOpen = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  render() {
    const { expanded } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <ButtonAppBar
          projectName={this.state.projName}
        />
        <div
          className="parallax"
          style={{
            display: 'flex',
            flexGrow: 1,
            backgroundColor: 'dimgray',
            paddingTop: 75,
            resizeMode: 'cover',
            height: "-webkit-fill-available"
          }} >
          <Tab
            isActive={this.state.isActive}
            futureSprint={this.state.futureSprint}
            getTasks={this.getTasks}
            summaryTab={<Summary
              members={this.state.members}
              completed={this.state.completedTasks}
              assigned={this.state.assignedTasks}
              unAssigned={this.state.unassignedTasks}
              currentSprint={this.state.sprintId}
              sprints={this.state.sprints}
            />}
            taskPool={<List style={{
              width: '100%',
              maxWidth: '100%',
              position: 'relative',
              overflow: 'auto',
            }}>
              {(!this.state.isActive && !this.state.futureSprint) ?
                <li>
                  {this.state.unassignedTasks.map((task) => {
                    return (
                      <ul>
                        <ListItem classes={{ root: classes.root }}>
                          <Pool
                            key={task.id}
                            id={this.key}
                            isAdmin={this.state.isAdmin}
                            tasks={task}
                            onClickDelete={this.deleteTask.bind(this, task)}
                            onClickAdd={this.assignTask.bind(this, task)}
                            currentUser={this.state.currentUser}
                            expanded={expanded === `panel${task.id}`}
                            onChange={this.handleTaskOpen(`panel${task.id}`)}
                            edit={() => this.handleOpen('editTaskOpen', task.id, task.name, task.description, task.due_date, task.complexity, task.stack)}
                            location='open tasks'
                            active={this.state.isActive}
                            futureSprint={this.state.futureSprint}
                          />
                        </ListItem>
                      </ul>
                    );
                  })}
                </li> :
                <li>
                  {(this.state.isAdmin === true) ?
                    <ListItem button style={{ width: '50%' }} onClick={() => this.handleOpen('taskOpen')} title="ADD TASK">
                      <ListItemIcon><Add /></ListItemIcon>
                      <ListItemText primary='ADD TASK' />
                    </ListItem>
                    :
                    ""}
                  {this.state.showComplete ? this.state.completedTasks.map((task) => {
                    return (
                      <ul>
                        <ListItem classes={{ root: classes.root }}>
                          <Pool
                            key={task.id}
                            id={this.key}
                            isAdmin={this.state.isAdmin}
                            tasks={task}
                            onClickDelete={this.deleteTask.bind(this, task)}
                            onClickReopen={() => this.reopenTask(task.id)}
                            assignedUser={task.assigned_id}
                            assigned={true}
                            currentUser={this.state.currentUser}
                            expanded={expanded === `panel${task.id}`}
                            onChange={this.handleTaskOpen(`panel${task.id}`)}
                            location='complete'
                            complete
                            active={this.state.isActive}
                            futureSprint={this.state.futureSprint}
                          />
                        </ListItem>
                      </ul>
                    );
                  }) : this.state.unassignedTasks.map((task) => {
                    return (
                      <ul>
                        <ListItem classes={{ root: classes.root }}>
                          <Pool
                            key={task.id}
                            id={this.key}
                            isAdmin={this.state.isAdmin}
                            tasks={task}
                            onClickDelete={this.deleteTask.bind(this, task)}
                            onClickAdd={this.assignTask.bind(this, task)}
                            currentUser={this.state.currentUser}
                            expanded={expanded === `panel${task.id}`}
                            onChange={this.handleTaskOpen(`panel${task.id}`)}
                            edit={() => this.handleOpen('editTaskOpen', task.id, task.name, task.description, task.due_date, task.complexity, task.stack)}
                            location='open tasks'
                            active={this.state.isActive}
                            futureSprint={this.state.futureSprint}
                          />
                        </ListItem>
                      </ul>
                    );
                  })}
                </li>}
            </List>}

            userPool={<UserPool
              isAdmin={this.state.isAdmin}
              currentUser={this.state.currentUser}
              sprintId={this.state.sprintId}
              members={this.state.members}
              tasks={this.state.assignedTasks}
              unassign={this.unassignTask}
              onClickDelete={this.deleteTask}
              onClickComplete={this.markComplete}
              futureSprint={this.state.futureSprint}
              active={this.state.isActive}
            />}

            projectName={this.state.projName}

            inviteCode={<SimplePopper
              onPoperClick={this.inviteMember}
              message={this.state.inviteCode}
            />}

            sprintProgress={
              <LinearDeterminate
                completedTask={this.state.SprintProgress}
                title1={<div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                ><Typography
                  variant='subtitle1'
                  style={{
                    marginRight: 10
                  }}
                >
                    Sprint Progress:
              </Typography>
                  <Typography
                    variant='subtitle2'
                    style={{
                      marginRight: 20
                    }}
                  >
                    {this.state.completedTasks.length}/{this.state.unassignedTasks.length + this.state.assignedTasks.length + this.state.completedTasks.length}
                  </Typography>
                  <Typography
                    variant='subtitle2'
                  >
                    {(this.state.unassignedTasks.length + this.state.assignedTasks.length + this.state.completedTasks.length !== 0) ? (this.state.completedTasks.length / (this.state.unassignedTasks.length + this.state.assignedTasks.length + this.state.completedTasks.length) * 100).toFixed(2) + '%' : ""}
                  </Typography></div>}
                completedTime={this.state.SprintTime}
                title2={<div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                ><Typography
                  variant='subtitle1'
                  style={{
                    marginRight: 10
                  }}
                >
                    Time Remaining:
            </Typography>
                  <Typography
                    variant='subtitle2'
                  >
                    {this.state.countdown}
                  </Typography></div>
                }
              />

              /* <LinearDeterminate whatBar completedTime={this.state.SprintTime} title2={`Time Remaining: ${this.state.countdown}`} /></div> */
            }
            // sprintTime={<LinearDeterminate whatBar completed={this.state.SprintTime} title2={`Time Remaining: ${this.state.countdown}`} />}
            completedTab={this.state.completedTasks.map((task) => {
              return (
                <ul>
                  <ListItem classes={{ root: classes.root }}>
                    <Pool
                      key={task.id}
                      id={this.key}
                      isAdmin={this.state.isAdmin}
                      tasks={task}
                      onClickDelete={this.deleteTask.bind(this, task)}
                      onClickReopen={() => this.reopenTask(task.id)}
                      assignedUser={task.assigned_id}
                      currentUser={this.state.currentUser}
                      expanded={expanded === `panel${task.id}`}
                      onChange={this.handleTaskOpen(`panel${task.id}`)}
                      location='complete'
                      complete
                      active={this.state.isActive}
                      futureSprint={this.state.futureSprint}
                    />
                  </ListItem>
                </ul>
              );
            })}
            onClick={() => this.handleOpen('taskOpen')}
            title='ADD TASK'
          />

          <SimpleModalSprintWrapped
            open={this.state.sprintOpen}
            onClose={() => this.handleClose('sprintOpen')}
            name="Add a New Sprint ..."
            onSubmit={this.addSprint}
            onChange={this.handleChange}>

            <AddSprintLayout />

          </SimpleModalSprintWrapped>

          <SimpleModalWrapped
            open={this.state.taskOpen}
            onClose={() => this.handleClose('taskOpen')}
            name="Add a New Task ..."
            onSubmit={this.addTask}
            onChange={this.handleChange}
            errorTaskMess={this.state.errorTaskMess}
            errorTaskCode={this.state.errorTaskCode}
            defaultDueDate={this.state.taskDue_date}
          >
          </SimpleModalWrapped>

          {/* edit task modal */}
          <SimpleModalWrapped
            open={this.state.editTaskOpen}
            onClose={() => this.handleClose('editTaskOpen')}
            name="Edit Task..."
            onSubmit={() => this.editTask(this.state.currentTaskId)}
            onChange={this.handleChange}
            taskName={this.state.currentTaskName}
            taskDue_date={this.state.currentTaskDueDate}
            taskDescription={this.state.currentTaskDescription}
            taskComplexity={this.state.currentTaskComplexity}
            taskStack={this.state.currentTaskStack}
            errorTaskMess={this.state.errorTaskMess}
            errorTaskCode={this.state.errorTaskCode}
            edit
          >

          </SimpleModalWrapped>

          <ClippedDrawer
            balls={() => this.handleOpen('sprintOpen')}
            title="ADD SPRINT"
            isAdmin={this.state.isAdmin}
            sprints={this.state.chipData}
            onClick={this.updateActiveSprint}
            activeSprint={this.state.sprintId}
            currentUser={this.state.currentUser}
          />
        </div>
        {this.state.showsnack ? <AlertSnackbar
          open={this.state.showsnack}
          variant={this.state.snackType}
          message={this.state.errorTaskMess}
        /> : null}
      </div>
    );
  }
}

Project.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Project);
