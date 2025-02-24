import type { Sub } from '../types/events';

export const paidUpgrade: Sub = {
  _id: '628c61dbfcbe884aa7c627dc',
  payload: {
    userstate: {
      'display-name': 'Super_Tristan1005',
      login: 'super_tristan1005',
      'msg-id': 'giftpaidupgrade',
      'msg-param-sender-login': 'atothe3',
      'msg-param-sender-name': 'Atothe3',
      'tmi-sent-ts': '1650650247266',
    },
  },
  cleared: true,
  createdAt: '2022-09-08T16:46:27.143Z',
};

export const primepaidupgrade: Sub = {
  _id: '628c61dbfcbe884aa7c627dc',
  payload: {
    userstate: {
      'display-name': 'Super_Tristan1005',
      login: 'super_tristan1005',
      'msg-id': 'primepaidupgrade',
      'tmi-sent-ts': '1650650247266',
      'msg-param-sub-plan': '2000',
    },
  },
  cleared: true,
  createdAt: '2022-09-08T16:46:27.143Z',
};
