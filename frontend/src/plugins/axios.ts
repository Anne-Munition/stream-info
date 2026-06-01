import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response?.status === 401) {
      if (error.response?.data?.code === 'TWITCH_TOKEN_INVALID') {
        if (router.currentRoute.value.name !== 'Reauth') {
          router.push({ name: 'Reauth' });
        }
        return Promise.reject(error);
      }

      window.location.href = '/api/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
