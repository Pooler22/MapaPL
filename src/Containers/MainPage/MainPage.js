import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from './Drawer';
import AppBar from './AppBar';
import Typography from 'material-ui/Typography';

const drawerWidth = 240;

const margin = 'margin';
const styles = ({ mixins, palette, spacing, transitions }) => ({
  appFrame: {
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%'
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: palette.background.default,
    padding: spacing.unit * 3,
    transition: transitions.create(margin, {
      easing: transitions.easing.sharp,
      duration: transitions.duration.leavingScreen
    })
  },
  'content-left': {
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: transitions.create(margin, {
      easing: transitions.easing.easeOut,
      duration: transitions.duration.enteringScreen
    })
  },
  'contentShift-left': {
    marginLeft: 0
  },
  'contentShift-right': {
    marginRight: 0
  }
});

class PersistentDrawer extends React.Component {
  state = {
    open: false
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, theme } = this.props;
    const { open } = this.state;

    return (
      <div className={classes.appFrame}>
        <AppBar open={open} handleDrawerOpen={this.handleDrawerOpen} />
        <Drawer open={open} handleDrawerClose={this.handleDrawerClose} />
        <main
          className={classNames(classes.content, classes[`content-left`], {
            [classes.contentShift]: open,
            [classes[`contentShift-left`]]: open
          })}
        >
          <div className={classes.drawerHeader} />
          <Typography>
            {'You think water moves fast? You should see ice.'}
          </Typography>
        </main>
      </div>
    );
  }
}

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(PersistentDrawer);
