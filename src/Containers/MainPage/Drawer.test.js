import React from 'react';
import ReactDOM from 'react-dom';
import Drawer from './Drawer';
import { shallow } from 'enzyme';

it('renders without crashing  when open false', () => {
  shallow(<Drawer open={false} />);
});

it('renders without crashing  when open true', () => {
  shallow(<Drawer open={true} />);
});
