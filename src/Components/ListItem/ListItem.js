import React, { Children } from 'react';
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

const CategoryItem = ({ children, classes, item, onClick, button }) => (
  <ListItem onClick={onClick} className={classes} button={button}>
    {item.icon && (
      <ListItemIcon>
        <FontAwesome name={item.icon} />
      </ListItemIcon>
    )}
    <ListItemText inset primary={item.name} />
    {children}
  </ListItem>
);

CategoryItem.defaultProps = {
  classes: '',
  item: {
    name: ''
  },
  button: false,
  onClick: () => {}
};

const ListItems = ({
  open,
  handleClick,
  classes,
  id,
  name,
  icon,
  subcategory
}) => (
  <React.Fragment>
    <CategoryItem onClick={handleClick} item={{ icon, name }} button>
      {!!subcategory && (open ? <ExpandLess /> : <ExpandMore />)}
    </CategoryItem>
    {!!subcategory && (
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {subcategory.map(item => (
            <CategoryItem
              item={item}
              classes={classes.nested}
              key={item.id}
              button
            />
          ))}
        </List>
      </Collapse>
    )}
  </React.Fragment>
);

ListItems.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles({ styles }, { withTheme: true })(ListItems);
