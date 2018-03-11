import React from 'react';
import FontAwesome from 'react-fontawesome';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { checkA11y } from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered';
import backgrounds from '@storybook/addon-backgrounds';
import { withInfo } from '@storybook/addon-info';

import ListItem from './ListItem';

const category = {
  id: '0',
  name: 'Wydziały',
  handleClick: action('handleClick')
};

const categoryWithIcon = Object.assign(category, {
  icon: 'industry'
});

const categoryWithSubcategories = Object.assign(categoryWithIcon, {
  subcategory: [
    {
      id: '1',
      name: 'Mechaniczny',
      icon: 'cogs',
      short_name: 'Mechaniczny',
      short: 'W1'
    }
  ]
});

storiesOf('ListItem', module)
  .addDecorator((story, context) => withInfo('common info')(story)(context))
  .addDecorator(checkA11y)
  .addDecorator(
    backgrounds([
      { name: 'light', value: '#f9f9f9', default: true },
      { name: 'dark', value: '#010101' }
    ])
  )
  .addDecorator(centered)

  .add('default', () => <ListItem />)
  .add('with data', () => <ListItem {...category} />)
  .add('with data and icon', () => <ListItem {...categoryWithIcon} />)
  .add('with data, icon and subcategories', () => (
    <ListItem {...categoryWithSubcategories} />
  ));
