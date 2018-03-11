import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import ListSubheader from 'material-ui/List/ListSubheader';
import List from 'material-ui/List';

import ListItems from './ListItem';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
});

class CategoriesList extends React.Component {
  state = {
    open: false
  };

  handleClick = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const { classes, categories } = this.props;
    return (
      <div className={classes.root}>
        <List
          component="nav"
          subheader={<ListSubheader component="div">Miejsca</ListSubheader>}
        >
          {categories.map(item => (
            <ListItems
              open={this.state.open}
              handleClick={this.handleClick}
              {...item}
            />
          ))}
        </List>
      </div>
    );
  }
}

CategoriesList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles({ styles }, { withTheme: true })(CategoriesList);
