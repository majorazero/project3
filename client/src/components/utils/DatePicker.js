import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

function DatePickers(props) {
  const { classes } = props;

  return (
      <TextField
        id={props.id}
        label={props.label}
        name={props.name} 
        type="date"
        defaultValue="2018-11-06"
        className={classes.textField}
        onChange={props.onChange}
        // InputLabelProps={{
        //   shrink: false,
        // }}
      />
  );
}

DatePickers.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DatePickers);