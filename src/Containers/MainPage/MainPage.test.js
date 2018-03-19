import React from 'react';
import MainPage from './MainPage';
import { shallow } from 'enzyme';

it('renders without crashing', () => {
  shallow(<MainPage />);
});
