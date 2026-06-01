import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LogoutView from '@/views/LogoutView.vue';
import NotFoundView from '@/views/NotFound.vue';
import SettingsView from '@/views/SettingsView.vue';
import SusTermsView from '@/views/SusTermsView.vue';
import ReauthView from '@/views/ReauthView.vue';
import UnauthorizedView from '@/views/UnauthorizedView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/unauthorized',
      name: 'Unauthorized',
      component: UnauthorizedView,
    },
    {
      path: '/logout',
      name: 'Logout',
      component: LogoutView,
    },
    {
      path: '/reauth',
      name: 'Reauth',
      component: ReauthView,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsView,
    },
    {
      path: '/terms',
      name: 'SusTerms',
      component: SusTermsView,
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
});

export default router;
