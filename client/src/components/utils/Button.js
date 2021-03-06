import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
    width: 'fit-content'
  },
  input: {
    display: 'none',
  },
});

function ContainedButtons(props) {
  const classes = props.classes;
  return (
    <Button
      size={props.size}
      variant="contained"
      color={props.color}
      className={classes.button}
      to={props.to}
      component={props.component}
      onClick={props.onClick}
      target={props.target}
      style={props.hidden ? { display: 'none' } : { display: "" }}
    >
      {props.name}

    </Button>
  );
}

ContainedButtons.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContainedButtons);
