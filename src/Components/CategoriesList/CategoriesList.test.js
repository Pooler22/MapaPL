import React from 'react';
import CategoriesListDefault from './index';
import CategoriesList from './CategoriesList';
import { shallow } from 'enzyme';

test('renders without crashing', () => {
  it('without props', () => {
    shallow(<CategoriesListDefault />);
  });

  it('with default data', () => {
    shallow(<CategoriesList />);
  });

  it('with initial data', () => {
    const categories = [
      {
        id: '0',
        name: 'Wydziały',
        icon: 'industry'
      }
    ];

    shallow(<CategoriesList categories={categories} />);
  });

  it('with initial data and subcategory', () => {
    const categories = [
      {
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
      }
    ];

    shallow(<CategoriesList categories={categories} />);
  });
});
