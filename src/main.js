import Vue from 'vue';
import Vuex from 'vuex';

// Bootstrap
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Font-awesome
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon.vue';

// Axios
import axios from 'axios';

// Moment.js
import VueMoment from 'vue-moment';
import moment from 'moment-timezone';

//
import App from './App.vue';
import router from './router';

window.axios = axios;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

Vue.use(Vuex);
Vue.use(BootstrapVue);
Vue.use(VueMoment, {
  moment,
});
Vue.component('v-icon', Icon);

// Initialize Vuex
const store = new Vuex.Store({
  state: {
    isMetric: true,
  },
  mutations: {
    changeMeasurement(state, to) {
      state.isMetric = to;
    },
  },
});

new Vue({
  router,
  store,
  render(h) { return h(App); },
}).$mount('#app');
