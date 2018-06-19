import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import CategoryItem from '../CategoryItem';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class ListItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.handleOnClick = this.handleOnClick.bind(this);
    this.renderCategoryItem = this.renderCategoryItem.bind(this);
  }

  handleOnClick() {
    this.setState({ open: !this.state.open });
  }

  renderCategoryItem(collection, open, classes) {
    return (
      !!collection && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {collection.map(item => (
              <CategoryItem
                item={item}
                onClick={this.props.onSelectPlace(item)}
                classes={classes.nested}
                key={item.id}
                button
              />
            ))}
          </List>
        </Collapse>
      )
    );
  }

  render() {
    const { classes, name, icon, subcategory, places } = this.props;
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
