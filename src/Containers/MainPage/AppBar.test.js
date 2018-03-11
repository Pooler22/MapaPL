import React from 'react';
import ReactDOM from 'react-dom';
import AppBar from './AppBar';
import { shallow } from 'enzyme';

it('renders without crashing when open true', () => {
  shallow(<AppBar open={true} />);
});

it('renders without crashing when open false', () => {
  shallow(<AppBar open={false} />);
});
