import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import initStoryshots from '@storybook/addon-storyshots';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

initStoryshots();

configure({ adapter: new Adapter() });
