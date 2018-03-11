import React from 'react';
import ListItem from './ListItem';
import { shallow } from 'enzyme';

test('renders without crashing with ', () => {
  it('default data', () => {
    shallow(<ListItem />);
  });

  it('initial data', () => {
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
});
