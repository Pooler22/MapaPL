import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import StarBorder from 'material-ui-icons/StarBorder';
import FontAwesome from 'react-fontawesome';

import CategoryItem from '../CategoryItem';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class ListItems extends React.Component {
  state = {
    open: false,
  };

  handleOnClick = () => {
    this.setState({ open: !this.state.open });
  };

  renderCategoryItem = (collection, open, classes) => {
    return (
      !!collection && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {collection.map(item => (
              <CategoryItem
                item={item}
                classes={classes.nested}
                key={item.id}
                button
              />
            ))}
          </List>
        </Collapse>
      )
    );
  };

  render() {
    const { classes, id, name, icon, subcategory, places } = this.props;

    const { open } = this.state;

    return (
      <React.Fragment>
        <CategoryItem onClick={this.handleOnClick} item={{ icon, name }} button>
          {(!!subcategory || !!places) &&
            (open ? <ExpandLess /> : <ExpandMore />)}
        </CategoryItem>
        {this.renderCategoryItem(subcategory, open, classes)}
        {this.renderCategoryItem(places, open, classes)}
      </React.Fragment>
    );
  }
}

ListItems.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles({ styles }, { withTheme: true })(ListItems);
