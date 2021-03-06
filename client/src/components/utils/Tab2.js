import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

function TabContainer(props) {
  return (
    <Typography
            component="div"
            style={{
                padding: 8 * 3,
                position: 'relative',
            }}
        >
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 25,
    overflow: 'auto'
    
  },
});

class SimpleTabs2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
    };
  }
  handleChange = (event, value) => {
      this.setState({ value });
  };
  
  render() {
    const { classes } = this.props;
    const { value } = this.state;
    return (
      <Paper className={classes.root}>
        <Tabs
          style={{paddingTop: 10, position: 'sticky', top: 0, backgroundColor: '#424242', zIndex: 10}}
          value={this.state.value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Active Tasks" />
          <Tab label="Projects" />
          <Tab label="Statistics" />
        </Tabs>
        {value === 0 && <TabContainer>{this.props.activeTasks}</TabContainer>}
        {value === 1 && <TabContainer>{this.props.projectList}</TabContainer>}
        {value === 2 && <TabContainer>{this.props.userSummary}</TabContainer>}
      </Paper>
    );
  }
}

SimpleTabs2.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTabs2);
