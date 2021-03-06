import React from 'react';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import CategoriesList from '../../Components/CategoriesList';

const drawerWidth = 450;

const styles = theme => ({
  appFrame: {
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    // ...theme.mixins.toolbar,
  },
});

const MyDrawer = ({
  open,
  classes,
  theme,
  handleDrawerClose,
  places,
  categories,
  onSelectPlace,
}) => {
  const mapPlaces = (items = []) =>
    items.map(item => ({
      ...item,
      places: places.filter(({ category }) => category === item.id),
      subcategory: mapPlaces(item.subcategory),
    }));

  const newCategories = mapPlaces(categories);

  return (
    <Drawer
      variant="persistent"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl' ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </div>
      <Divider />
      <CategoriesList
        onSelectPlace={onSelectPlace}
        categories={newCategories}
      />
      <Divider />
    </Drawer>
  );
};

export default withStyles(styles, { withTheme: true })(MyDrawer);
