import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import StarBorder from 'material-ui-icons/StarBorder';
import FontAwesome from 'react-fontawesome';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4
  }
});

const ListItems = ({
  open,
  handleClick,
  classes,
  id,
  name,
  icon,
  subcategory
}) => (
  <React.Fragment key={`categories-${id}`}>
    <ListItem key={`category-${id}`} onClick={handleClick} button>
      {icon && (
        <ListItemIcon>
          <FontAwesome name={!!icon} />
        </ListItemIcon>
      )}
      <ListItemText inset primary={name} />
      {!!subcategory && (open ? <ExpandLess /> : <ExpandMore />)}
    </ListItem>
    {!!subcategory && (
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText inset primary="Starred" />
          </ListItem>
        </List>
      </Collapse>
    )}
  </React.Fragment>
);

ListItems.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles({ styles }, { withTheme: true })(ListItems);
