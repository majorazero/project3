import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Grid } from "@material-ui/core";
import axios from "axios";
import ProjectListTab from "./ProjectListTab/ProjectListTab.js";
import SimpleModalProjectWrapped from "../utils/ModalProject.js";
import AddProjectLayout from "../utils/AddProjectLayout.js";
import ButtonSizes from "../utils/FAB.js";
import GridList from '@material-ui/core/GridList';


class ProjectList extends Component {
  state = {
    name: "",
    summary: "",
    due_date: "",
    projects: [],
    open: false,
    direction: 'column',
    justify: 'flex-start',
    alignItems: 'flex-start',
    projects: [],
    inviteCode: ""
  }

  componentDidMount = () => {
    this.fetch();
  }

  fetch = () => {
    axios.post("/api/projectOfUser", {
      id: sessionStorage.getItem("id"),
      token: localStorage.getItem("token")
    }).then((response) => {
      this.setState({ projects: response.data });
    });
  }

  populate = () => {
    console.log(this.state);
    if (this.state.projects.length === 0) {
      //maybe ill replace this with something if no projects appeared yet.
      return <h1>Oops no projects yet.</h1>;
    }
    else {
      return this.state.projects.map((item) => {
        return <ProjectListTab
          key={item.id}
          name={item.name}
          summary={item.summary}
          duedate={item.due_date}
          onProjectPress={() => { this.onProjectPress(item.id) }} />;
      });
    }
  }

  //we'll pass project id into this and link it to a specific project page
  onProjectPress = (id) => {

    axios.post("/api/encrypt", {
      token: "project",
      id: id.toString()
    }).then((data) => {
      window.location.assign(`/project/${data.data}`);
    });
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    }, () => {
      console.log(this.state.due_date)
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    //we'll create a project now.
    axios.post("/api/project", {
      name: this.state.name,
      summary: this.state.summary,
      due_date: this.state.due_date,
      id: sessionStorage.getItem("id"),
      token: localStorage.getItem("token")
    }).then((response) => {
      this.fetch();
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

  handleInviteSubmit = (event) => {
    event.preventDefault();
    axios.post("/api/sprintMembershipWithCode", { sId: this.state.inviteCode, uId: sessionStorage.getItem("id"), token: localStorage.getItem("token") }).then((response) => {
      console.log(response.data);
    });
    console.log(this.state.inviteCode);
  }

  render() {
    const { direction, justify, alignItems } = this.state;
    return (
      <div>
        <Grid xs={12}
          container
          alignItems={alignItems}
          direction={direction}
          justify={justify}
          style={{ marginBottom: 20 }}
        >
          <SimpleModalProjectWrapped
            open={this.state.open}
            onClose={this.handleClose}
            name="Add a New Project ..."
            onSubmit={this.handleSubmit}
            onChange={this.handleChange}
          >

            <AddProjectLayout
            />
          </SimpleModalProjectWrapped>
          <div className="projList" >
            <Grid item xs={12}>
              <div style={{
                boxShadow: "4px 4px 5px 1px rgb(23, 23, 23, 0.5)",
                border: "10px solid lightgray",
                borderRadius: "20px",
                paddingTop: "7px",
                paddingBottom: "7px",
                paddingLeft: "6px",
                paddingRight: "6px",
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                // maxWidth: 700,
                overflow: 'hidden',
                // width: "1200px"
                marginTop: 20,

              }}>
                <GridList style={{
                  flexWrap: 'nowrap',
                  transform: 'translateZ(0)',
                  width: "100%"
                }}>
                  {this.populate()}
                </GridList>
              </div>
            </Grid>
            <ButtonSizes
              onClick={this.handleOpen}
            />
            <h2>Join Sprint with Invite Code</h2>

            <div className="invCodeDiv">
              <form onSubmit={this.handleInviteSubmit}>
                <h3>Invite Code:</h3>
                <input type="text" name="inviteCode" onChange={this.handleChange} />
                <button>Submit</button>
              </form>
            </div>
          </div>
        </Grid>
      </div>
    );
  }
}

export default ProjectList;
