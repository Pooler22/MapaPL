import React from 'react';
import ListItem from './ListItem';
import { shallow } from 'enzyme';

it('default data', () => {
  shallow(<ListItem />);
});

it('initial data', () => {
  const category = {
    id: '0',
    name: 'Wydziały',
    icon: 'industry',
    subcategory: [
      {
        id: '1',
        name: 'Mechaniczny',
        icon: 'cogs',
        short_name: 'Mechaniczny',
        short: 'W1',
      },
    ],
  };

  // const wrapper = mount(getComponent(commonProps));
  // wrapper
  //   .find(ListItem)
  //   .first()
  //   .simulate('press');

  // output.simulate('click');
  // expect(window.alert).toHaveBeenCalledWith('clicked');

  shallow(<ListItem category={category} />);
});
