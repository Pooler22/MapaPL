import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "material-ui/styles";
import ListSubheader from "material-ui/List/ListSubheader";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import Collapse from "material-ui/transitions/Collapse";
import ExpandLess from "material-ui-icons/ExpandLess";
import ExpandMore from "material-ui-icons/ExpandMore";
import StarBorder from "material-ui-icons/StarBorder";
import Icon from "material-ui/Icon";
import FontAwesome from "react-fontawesome";

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4
  }
});

class CategoriesList extends React.Component {
  state = {
    open: false
  };

  handleClick = () => {
    this.setState({ open: !this.state.open });
  };

  renderListItems = ({ id, name, icon, subcategory }) => (
    <React.Fragment key={`categories-${id}`}>
      <ListItem key={`category-${id}`} onClick={this.handleClick} button>
        <ListItemIcon>
          <FontAwesome name={icon} name={icon} />
        </ListItemIcon>
        <ListItemText inset primary={name} />
        {subcategory && (this.state.open ? <ExpandLess /> : <ExpandMore />)}
      </ListItem>
      {subcategory && (
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button className={this.props.classes.nested}>
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

  render() {
    const { classes, categories } = this.props;
    return (
      <div className={classes.root}>
        <List
          component="nav"
          subheader={<ListSubheader component="div">Miejsca</ListSubheader>}
        >
          {categories.map(this.renderListItems)}
        </List>
      </div>
    );
  }
}

CategoriesList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles({ styles }, { withTheme: true })(CategoriesList);
