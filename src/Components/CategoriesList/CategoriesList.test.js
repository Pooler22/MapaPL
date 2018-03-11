import React from 'react';
import CategoriesListDefault from './index';
import CategoriesList from './CategoriesList';
import { shallow } from 'enzyme';

it('renders without crashing', () => {
  shallow(<CategoriesListDefault />);
});

it('renders without crashing with default data', () => {
  shallow(<CategoriesList />);
});

it('renders without crashing with initial data', () => {
  const categories = [
    {
      id: '0',
      name: 'Wydziały',
      icon: 'industry'
    }
  ];

  shallow(<CategoriesList categories={categories} />);
});

it('renders without crashing with initial data and subcategory', () => {
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
