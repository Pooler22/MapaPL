import { configure } from '@storybook/react';

function loadStories() {
  require('../src/Components/ListItem/ListItem.story');
}

configure(loadStories, module);
