import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from './Drawer';
import AppBar from './AppBar';

import { MyMapComponent } from '../Map';
import categories from './data/categories';
import places from './data/places';
import buildings from './data/buildings';

const drawerWidth = 440;

const margin = 'margin';
const styles = ({ mixins, palette, transitions }) => ({
  appFrame: {
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // ...mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: palette.background.default,
    transition: transitions.create(margin, {
      easing: transitions.easing.sharp,
      duration: transitions.duration.leavingScreen,
    }),
  },
  'content-left': {
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: transitions.create(margin, {
      easing: transitions.easing.easeOut,
      duration: transitions.duration.enteringScreen,
    }),
  },
});

class PersistentDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      selectedPlace: null,
      selectedBuildings: null,
    };

    this.handleDrawerOpen = this.handleDrawerOpen.bind();
    this.handleDrawerClose = this.handleDrawerClose.bind();
  }

  handleDrawerOpen() {
    this.setState({ open: true });
  }

  handleDrawerClose() {
    this.setState({ open: false });
  }

  onSelectPlace = selectedPlace => () => {
    const selectedBuildings = buildings.filter(item =>
      selectedPlace.building.split(',').includes(item.id)
    );
    this.setState({ selectedPlace, selectedBuildings });
  };

  render() {
    const { classes } = this.props;
    const { open } = this.state;

    return (
      <div className={classes.appFrame}>
        <AppBar open={open} handleDrawerOpen={this.handleDrawerOpen} />
        <Drawer
          open={open}
          handleDrawerClose={this.handleDrawerClose}
          places={places}
          categories={categories}
          onSelectPlace={this.onSelectPlace}
        />
        <main
          className={classNames(classes.content, classes[`content-left`], {
            [classes.contentShift]: open,
            [classes[`contentShift-left`]]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          <MyMapComponent
            drawerWidth={open ? drawerWidth : 0}
            selectedPlace={this.state.selectedPlace}
            selectedBuildings={this.state.selectedBuildings}
          />
        </main>
      </div>
    );
  }
}

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PersistentDrawer);
