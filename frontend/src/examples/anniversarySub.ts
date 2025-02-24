import type { Sub } from '../types/events';

const anniversarySub: Sub = {
  _id: '6313877ab7e5fe37af30e3d1',
  payload: {
    userstate: {
      'display-name': 'Username',
      login: 'username',
      'msg-id': 'resub',
      'msg-param-cumulative-months': '24',
      'msg-param-months': false,
      'msg-param-multimonth-duration': false,
      'msg-param-multimonth-tenure': false,
      'msg-param-should-share-streak': false,
      'msg-param-sub-plan': '3000',
      'msg-param-was-gifted': 'false',
      'tmi-sent-ts': '1662162613282',
    },
    message: '2 years went by so fast. You are awesome!',
  },
  cleared: true,
  createdAt: '2022-09-08T16:46:27.143Z',
};

export default anniversarySub;
