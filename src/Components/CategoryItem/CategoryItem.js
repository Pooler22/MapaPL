import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import FontAwesome from 'react-fontawesome';

const CategoryItem = ({ children, classes, item, onClick, button }) => {
  return (
    <ListItem onClick={onClick} className={classes} button={button}>
      {' '}
      {item.icon && (
        <ListItemIcon>
          <FontAwesome name={item.icon} />{' '}
        </ListItemIcon>
      )}{' '}
      <ListItemText inset primary={item.name} /> {children}{' '}
    </ListItem>
  );
};

CategoryItem.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  classes: PropTypes.string,
  item: PropTypes.shape({
    icon: PropTypes.string,
    name: PropTypes.string,
  }),
  onClick: PropTypes.func,
  button: PropTypes.bool,
};

CategoryItem.defaultProps = {
  classes: '',
  item: {
    icon: '',
    name: '',
  },
  button: false,
  onClick: () => {},
};

export default CategoryItem;
