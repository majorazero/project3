import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
// import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
// import DeleteIcon from '@material-ui/icons/Delete';


function getFabStyle() {
  const top = 0;
  const left = 75;

  return {
      top: `${top}%`,
      left: `${left}%`,
      // transform: `translate(${top}%, -${left}%)`,
  };
}

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

function ButtonSizes(props) {
  const { classes } = props;
  return (
        <Button
        style={getFabStyle()}
        variant="fab" 
        mini 
        color="secondary" 
        aria-label="Add" 
        className={classes.button}
        onClick={props.onClick}
        >
          <AddIcon />
        </Button>
  );
}

ButtonSizes.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonSizes);