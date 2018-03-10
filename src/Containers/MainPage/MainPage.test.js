import React from 'react';
import ReactDOM from 'react-dom';
import MainPage from './MainPage';
import { shallow } from 'enzyme';

it('renders without crashing', () => {
  shallow(<MainPage />);
});
