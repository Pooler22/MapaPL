import React from 'react';
import ListItem from './ListItem';
import { shallow } from 'enzyme';

it('renders without crashing with default data', () => {
  shallow(<ListItem />);
});

it('renders without crashing with initial data', () => {
  const category = {
    id: '0',
    name: 'Wydziały',
    icon: 'industry',
    subcategory: [
      {
        id: '1',
        name: 'Mechaniczny',
        icon: 'cogs',
        short_name: 'Mechaniczny',
        short: 'W1'
      }
    ]
  };

  shallow(<ListItem category={category} />);
});
