import React from 'react';
import ReactDOM from 'react-dom';
import AppDefault from './index';
import App from './App';
import { shallow } from 'enzyme';

it('renders without crashing', () => {
  shallow(<AppDefault />);
});

it('renders without crashing', () => {
  shallow(<App />);
});
