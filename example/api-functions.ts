import axios from 'axios';
import { wait } from './utils/wait';

export const mutations = {
  updateFirsComment: () =>
    wait(1000, [{ id: 'yasin', name: 'yasin Tazeoglu' }]),

  getOverrider: async () =>
    wait(1200, {
      id: '9b76ad20-00f3-4695-a4a7-96e97df65f2b',
      balance: 'From Mutation',
    }),
};

export const queries = {
  getMoments: async () => wait(1200, { id: 'hello', registered: true }),
  getOverrider: async () =>
    wait(1200, {
      id: '9b76ad20-00f3-4695-a4a7-96e97df65f2b',
      balance: 'From Query',
    }),
  getAll: () =>
    axios
      .get('https://next.json-generator.com/api/json/get/VkjoqHFm_')
      .then(r => r.data as Array<{ id: string; balance: string }>),
};
