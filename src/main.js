
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import stars from './components/Stars.vue';

Vue.use(stars);
Vue.component('stars', stars);
Vue.config.productionTip = false;

new Vue({
  router,
  render(h) { return h(App); },
}).$mount('#app');
