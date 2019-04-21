<template>
  <div id="app">
    <stars id="stars" v-if="timeOfDay == 'night'" :count="20"></stars>
    <b-container>
      <header>
        <header-nav></header-nav>
      </header>
      <div id="cycles">
        <div class="btn" v-for="(time, i) in colors" :key="i" @click="changeTime(i)">{{i}}</div>
      </div>
      <router-view/>
    </b-container>
  </div>
</template>

<script>
import Velocity from 'velocity-animate';
import 'velocity-animate/velocity.ui';
import stars from './components/Stars.vue';
import headerNav from './components/Header.vue';

export default {
  components: {
    stars,
    headerNav,
  },
  data() {
    return {
      colors: {
        dawn: [
          '#AD4B0D 5%', '#B2A080 20%', '#182936 80%', '#010015 110%', // radial
        ],
        noon: [
          '#0259DF', '#c0d6ff', // linear
        ],
        afternoon: [
          // '#2E698B', '#D8C6B4 85%', '#C37E71', for linear
          '#C37E71', '#D8C6B4 25%', '#2E698B', // radial
        ],
        dusk: [
          // '#182936', '#704D2D 90%', '#4F1F12', for linear
          '#4F1F12', '#704D2D 20%', '#182936', // radial
        ],
        night: [
          '#010015 10%', '#181F56', // linear
        ],
      },
      timeOfDay: String,
    };
  },
  methods: {
    changeTime(time) {
      this.timeOfDay = time;
      this.updateBackground();
    },
    updateBackground() {
      const el = document.querySelector('#app');
      const time = {
        name: this.timeOfDay,
        colors: this.colors[this.timeOfDay],
      };
      let gradient;
      if (time.name !== 'dawn' && time.name !== 'afternoon' && time.name !== 'dusk') {
        gradient = 'linear-gradient(to bottom,';
        time.colors.forEach((element, index) => {
          gradient = `${gradient} ${element}${index === time.colors.length - 1 ? '' : ','}`;
        });
        gradient = `${gradient})`;
      } else {
        gradient = 'radial-gradient(ellipse 250% 100% at 50% 110%,';
        time.colors.forEach((element, index) => {
          gradient = `${gradient} ${element}${index === time.colors.length - 1 ? '' : ','}`;
        });
        gradient = `${gradient})`;
      }
      el.style.backgroundImage = gradient;
      el.style.backgroundSize = '100% 500%';
      Velocity(el, 'stop');
      Velocity(el, { backgroundSize: ['100% 100%', '100% 500%'] }, {
        duration: 2000,
        easing: [0.3, 0.5, 0.43, 1.01],
      });
    },
  },
  mounted() {
    this.timeOfDay = 'dusk';
    this.updateBackground();
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Rajdhani:300,500,700');
html *{
  font-family: 'Rajdhani', sans-serif;
}
#app{
  width: 100%;
  height: 100%;
  position: fixed;
}
#stars{
  width: 100%;
  height: 100%;
  position: absolute;
}
#cycles{
  display: flex;
  justify-content: space-between;
  width: 50%;
  bottom: 50px;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  >div{
    display: inline-flex;
  }
}
.btn{
  border: 1px solid white;
  border-radius: 5px;
  color: white;
  text-transform: uppercase;
  padding: 5px 10px;
  cursor: pointer;
  &:hover{
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
}
.form-control:focus{
  border-color: #ffffff;
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}
/* Google maps autocomplete */
.pac-container{
  background-color: #ffffff33;
}
.pac-item{
  cursor: pointer;
  color: #ccc;
  &:hover, &.pac-item-selected{
    background-color: #ffffff22;
  }
}
.pac-item-query{
  color: white;
}
</style>
