import campuses from './campuses';

it('renders without crashing', () => {
  expect(campuses.length).toBe(6);
});
