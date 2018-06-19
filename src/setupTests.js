import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import initStoryshots from '@storybook/addon-storyshots';

Enzyme.configure({ adapter: new Adapter() });

// Mock matchMedia
global.window.matchMedia = jest.fn(() => ({
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));

// jest.mock('scroll-to-element', () => 'scroll-to-element');

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

initStoryshots();
