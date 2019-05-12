<template>
  <div id="app">
    <stars id="stars" v-if="timeOfDay == 'night'" :count="20"></stars>
    <b-container>
      <header>
        <header-nav @choseCity="reloadForecast" :time="time"></header-nav>
      </header>
      <!--<div id="cycles">
        <div class="btn" v-for="(time, i) in colors" :key="i" @click="changeTime(i)">{{i}}</div>
      </div>-->
      <router-view @updateBackground="changeTime"></router-view>
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
      AppTitle: String,
      colors: {
        dawn: [
          '#AD4B0D 5%', '#B2A080 20%', '#182936 80%', '#010015 110%', // radial
        ],
        noon: [
          '#bdd4ff', '#1c64d2 90%', // radial
        ],
        afternoon: [
          '#C37E71', '#D8C6B4 25%', '#2E698B', // radial
        ],
        dusk: [
          '#4F1F12', '#704D2D 20%', '#182936', // radial
        ],
        night: [
          '#121844', '#010015 90%', // radial
        ],
      },
      timeOfDay: String,
      time: 0,
      timezone: String,
    };
  },
  methods: {
    changeTime(time, timezone) {
      this.time = time;
      this.timezone = timezone;
      if(this.timeOfDay != this.getPhaseOfDay) {
        this.timeOfDay = this.getPhaseOfDay;
        this.updateBackground();
      }    
    },
    updateBackground() {
      const el = document.querySelector('#app');
      const time = {
        name: this.timeOfDay,
        colors: this.colors[this.timeOfDay],
      };
      let gradient;
      gradient = 'radial-gradient(ellipse 250% 100% at 50% 110%,';
      time.colors.forEach((element, index) => {
        gradient = `${gradient} ${element}${index === time.colors.length - 1 ? '' : ','}`;
      });
      gradient = `${gradient})`;
      el.style.backgroundImage = gradient;
      el.style.backgroundSize = '100% 500%';
      Velocity(el, 'stop');
      Velocity(el, { backgroundSize: ['100% 100%', '100% 500%'] }, {
        duration: 2000,
        easing: [0.3, 0.5, 0.43, 1.01],
      });
    },
    reloadForecast(val) {
      console.log(val);
      this.$router.push(`/${encodeURI(val.address)}/${val.lat},${val.lon}`);
    },
  },
  computed: {
    getPhaseOfDay() {
      const d = (
        this.timezone
        ? this.$moment(this.time * 1000).tz(this.timezone)
        : this.$moment(this.time * 1000)
      );
      let result = String;
      if (d.hours() >= 5) result = 'dawn';
      if (d.hours() >= 8) result = 'noon';
      if (d.hours() >= 18) result = 'afternoon';
      if (d.hours() >= 20) result = 'dusk';
      if (d.hours() >= 22 || d.hours() < 5) result = 'night';
      return result;
    },
  },
  watch: {
    $route(to) {
      document.title = `${this.AppTitle} |  ${to.params.address}`;
    },
  },
  mounted() {
    this.AppTitle = document.title;
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Rajdhani:300,500,700');
html *{
  font-family: 'Rajdhani', sans-serif;
}
header {
  margin-bottom: 30px;
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
