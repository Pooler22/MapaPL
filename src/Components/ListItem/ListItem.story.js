import React from 'react';
// import FontAwesome from 'react-fontawesome';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
// import { linkTo } from '@storybook/addon-links';
import { checkA11y } from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered';
import backgrounds from '@storybook/addon-backgrounds';
import { withInfo } from '@storybook/addon-info';

import results from '../../../.jest-test-results.json';
import { withTests } from '@storybook/addon-jest';

import ListItem from './ListItem';

const newWithTests = withTests({
  results,
});

const category = {
  id: '0',
  name: 'Name',
  handleClick: action('handleClick'),
  onSelectPlace: action('onSelectPlace'),
};

const categoryWithIcon = Object.assign(category, {
  icon: 'menu',
});

const categoryWithSubcategories = Object.assign(categoryWithIcon, {
  subcategory: [
    {
      id: '1',
      name: 'Name',
      icon: 'menu',
      short_name: 'ShortNaem',
      short: 'Short',
    },
  ],
});

storiesOf('ListItem', module)
  .addDecorator(withTests('ListItem'))
  .addDecorator((story, context) => withInfo('common info')(story)(context))
  .addDecorator(checkA11y)
  .addDecorator(
    backgrounds([
      { name: 'light', value: '#f9f9f9', default: true },
      { name: 'dark', value: '#010101' },
    ])
  )
  .addDecorator(centered)
  .add('default', () => <ListItem />)
  .add('with data', () => <ListItem {...category} />)
  .add('with data and icon', () => <ListItem {...categoryWithIcon} />)
  .add('with data, icon and subcategories', () => (
    <ListItem {...categoryWithSubcategories} />
  ));
