<template>
  <div class="home">
    <div :class="{loading}">
      <b-row align-v="center">
        <b-col sm="6" xs="12">
          <weather-icon :icon="hourlyForecast[selectedHour].icon" />
        </b-col>
        <b-col xs="12">
          <b-row>
            <b-col>
              <h3 class="location-text">{{city}}</h3>
              <h5 class="time-text" v-if="!hourlyForecast.hasOwnProperty('0')">
                <span>{{ hourlyForecast[selectedHour].time | moment('timezone', timezone, 'HH') }}</span>
                <span class="time-separator" :class="{active: timeSeparator}">:</span>
                <span>{{ hourlyForecast[selectedHour].time | moment('timezone', timezone, 'mm') }}</span>
              </h5>
            </b-col>
          </b-row>
          <b-row class="current-info">
            <b-col cols="12" md="auto">
              <h1 class="temperature">{{convertTemperature(hourlyForecast[selectedHour].temperature, $store.state.isMetric, true)}}</h1>
              <p>{{hourlyForecast[selectedHour].summary}}</p>
            </b-col>
            <b-col class="small-info">
              <p>Feels like: {{convertTemperature(hourlyForecast[selectedHour].temperatureFeels, $store.state.isMetric, true)}}</p>
              <p>Humidity: {{Math.round(hourlyForecast[selectedHour].humidity*100)}}%</p>
              <p>UV index: {{hourlyForecast[selectedHour].uvIndex}}</p>
              <p>Chance of rain: {{Math.round(hourlyForecast[selectedHour].precip*100)}}%</p>
            </b-col>
            <b-col align-self="center">
              <b-row>
                <b-col cols="12" sm="auto"><v-icon name="location-arrow" scale="2" class="wind-pointer" :style="{transform:'rotate('+hourlyForecast[selectedHour].windDirection+'deg)'}"/></b-col>
                <b-col><h3>{{getWindSpeed}}</h3></b-col>
              </b-row>
            </b-col>
          </b-row>
          <b-row class="hourly-wrapper">
            <b-col style="text-align:center;">
              <h5>Hourly forecast</h5>
            </b-col>
            <vue-slider v-model="selectedHour" :width="'100%'" :marks="sliderMarks" :data="upcomingHours" :tooltip-formatter="formatAsTime" @change="hourlyChanged"></vue-slider>
          </b-row>
        </b-col>
      </b-row>
      <b-row>
        <div class="daily-wrapper">
          <div class="day fadeIn" v-for="(day, i) in dailyForecast" :key="i">
            <div class="day-name">{{day.time*1000 | moment('timezone', timezone, 'dddd') }}</div>
            <div class="icon">
              <weather-icon :icon="day.icon" :static="day.static" ref="day{{i}}"/>
            </div>
            <div class="temperatures">{{convertTemperature(day.temperatureHigh, $store.state.isMetric, true)}} / {{convertTemperature(day.temperatureLow, $store.state.isMetric, true)}}</div>
          </div>
        </div>
      </b-row>
    </div>
    <div id="loader" class="d-flex justify-content-between" :class="{loading}">
        <semipolar-spinner
          :animation-duration="2000"
          :size="100"
          :color="'#fff'"
          :class="{locating: currentLat === null}"
        />
    </div>
  </div>
</template>

<script>
import Velocity from 'velocity-animate';
import 'velocity-animate/velocity.ui';
import { SemipolarSpinner } from 'epic-spinners';
import WeatherIcon from '../helpers/WeatherIcon.vue';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  name: 'home',
  components: {
    SemipolarSpinner,
    WeatherIcon,
    VueSlider,
  },
  data() {
    return {
      loading: true,
      currentCity: '',
      currentLat: null,
      currentLng: null,
      city: '',
      time: '',
      timezone: '',
      timeSeparator: true,
      selectedHour: 0,
      hourlyForecast: {
        0: {
          time: null,
          summary: null,
          temperature: null,
          temperatureFeels: null,
          humidity: null,
          uvIndex: null,
          visibility: null,
          windDirection: null,
          windSpeed: null,
          icon: '',
          precip: null,
        }
      },
      dailyForecast: {},
      sliderMarks: null,
      formatAsTime: null,
      upcomingHours: [],
    };
  },
  methods: {
    loadForecast(coords) {
      this.loading = true;
      axios.get(`https://api.skymood.ml/forecast?lat=${coords.latitude}&long=${coords.longitude}`)
        .then((response) => {
          console.log(response);
          const current = response.data.currently;

          // Update current info
          this.timezone = response.data.timezone;
          this.setTime(current.time);

          this.upcomingHours = [];
          // Updating hourly info including now
          this.hourlyForecast = {}; // Reset

          // Slider marks
          response.data.hourly.data
          .filter((val, i) => (i <= 24))
          .map((val, i) => {
            if(i === 0) {
              this.selectedHour = this.time;
            }
            this.upcomingHours.push(( i === 0 ? this.selectedHour : val.time));
            this.hourlyForecast[( i === 0 ? this.selectedHour : val.time)] = {
              time: ( i === 0 ? this.selectedHour : val.time),
              summary: val.summary,
              temperature: val.temperature,
              temperatureFeels: val.apparentTemperature,
              humidity: val.humidity,
              uvIndex: val.uvIndex,
              visibility: val.visibility,
              windDirection: val.windBearing,
              windSpeed: val.windSpeed,
              icon: val.icon,
              precip: val.precipProbability,
            };
          }, this);

          let i = 0;
          this.sliderMarks = (val) => {
            if(val !== this.upcomingHours[0]){
              i += 1;
              return {
                label: (i % 3 === 0 ? this.$moment(val*1000).tz(this.timezone).format('HH:mm') : ''),
                labelStyle: {
                  color: '#ddd',
                },
                labelActiveStyle: {
                  color: 'white',  
                  transform: 'translateX(-50%) scale(1.15)',
                },
              };      
            } else {
              return {
                label: 'Now',
              };
            }
          };
          
          this.formatAsTime = val => this.$moment(val*1000).tz(this.timezone).format('HH:mm');

          // Daily forecast
          this.dailyForecast = response.data.daily.data.splice(1);
          this.dailyForecast.forEach((val) => {
            val.static = true;
          });

          if (this.$route.params.coords !== undefined) {
            this.city = this.$route.params.address;
          } else {
            this.city = this.currentCity;
          }
          this.loading = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    setTime(stamp) {
      this.time = stamp;
      this.$emit('updateBackground', this.time, this.timezone);
    },
    hourlyChanged() {
      this.setTime(this.selectedHour);
    },
    convertTemperature(temp, toCelsius, text) {
      return (toCelsius ? Math.floor(((temp - 32) * 5 / 9)) + (text ? '°C' : '') : Math.floor(temp) + (text ? '°F' : ''));
    },
  },
  computed: {
    getVisibility() {
      // Miles or kilometers
      return (this.$store.state.isMetric ? `${Math.floor(this.visibility * 1.609)} km` : `${Math.floor(this.visibility)} mi`);
    },
    getWindSpeed() {
      // Miles or kilomteters
      return (this.$store.state.isMetric ? `${Math.floor(this.hourlyForecast[this.selectedHour].windSpeed * 1.609)} kmh` : `${Math.floor(this.hourlyForecast[this.selectedHour].windSpeed)} mph`);
    },
  },
  watch: {
    $route(to) {
      // When a route changes, update the forecast
      const latLon = (to.params.coords !== undefined ? to.params.coords.split(',') : [this.currentLat, this.currentLng]);
      this.loadForecast({
        latitude: latLon[0],
        longitude: latLon[1],
      });
    },
  },
  mounted() {
    // Try to get users location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLat = position.coords.latitude;
        this.currentLng = position.coords.longitude;

        // Try to convert coords to actual address
        const geocoder = new google.maps.Geocoder;
        const self = this;
        geocoder.geocode(
          {
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          },
          (results, status) => {
            if (status === 'OK') {
              if (results[0]) {
                self.currentCity = results[results.length - 2].formatted_address;
                if (self.$route.params.coords === undefined) {
                  self.city = self.currentCity;
                  self.loadForecast({
                    latitude: self.currentLat,
                    longitude: self.currentLng,
                  });
                }
              } else {
                window.alert('No results found');
              }
            } else {
              window.alert(`Geocoder failed due to: ${status}`);
            }
          },
        );
      },
      (error) => {
        console.log(error);
      },
    );

    // Depending if the route has a location, load the route or current location
    if (this.$route.params.coords !== undefined) {
      const latLon = this.$route.params.coords.split(',');
      this.city = this.$route.params.address;
      this.loadForecast({
        latitude: latLon[0],
        longitude: latLon[1],
      });
    }

    // Start a timer for updated time each second
    this.setTime(Date.now() / 1000);
    const self = this;
    setInterval(() => {
      self.time += 1;
      self.timeSeparator = !self.timeSeparator;
    }, 1000);
  },
  created() {
    // Switch between metric and imperial with F or C keypress
    const self = this;
    document.addEventListener('keyup', (e) => {
      if (e.target.tagName !== 'INPUT') {
        if (e.key === 'c') self.$store.commit('changeMeasurement', true);
        else if (e.key === 'f') self.$store.commit('changeMeasurement', false);
      }
    });
  },
};
</script>
<style lang="scss">
* {
  color: white;
}
.location-text, .time-text {
  display: inline;
}
.time-text {
  margin-left: 10px;
  .time-separator {
    visibility: hidden;
    &.active {
      visibility: visible;
    }
  }
}
.home>div:first-child {
  opacity: 1;
  transition: all 0.5s ease-in-out;
  &.loading {
    opacity: 0;
    transform: translateY(200px);
  }
}
#loader {
   transform: translate(-50%, -40%);
   left: 50%;
   top: 50%;
   opacity: 0;
   position: absolute;
   display: none;
   transition: all 0.5s ease-in-out;
   &.loading {
     display: flex;
     transform: translate(-50%, -50%);
     opacity: 1;
   }
   .semipolar-spinner {
      &.locating:after{
        content: "Locating...";
        position: absolute;
        bottom: -20px;
        text-align: center;
        width: 100%;
      }
   }
}
.current-info {
  .small-info {
    padding-top: 10px;
    p {
      margin-bottom: -5px;
    }
  }
}
.temperature {
  font-size: 80px;
  margin-bottom: -15px;
}
.hourly-forecast {
  height: 300px;
}
.vue-slider{
  .vue-slider-rail {
    background-color: #cccccc66;
    .vue-slider-process {
      background-color: white;
    }
    .vue-slider-mark-step {
      background-color: rgba(255, 255, 255, 0.5);
    }
    .vue-slider-mark-label {
      transition: all 0.3s;
    }
    .vue-slider-dot-tooltip-inner {
      background-color: #aaaaaaaa;
    }
    .vue-slider-dot-tooltip-inner-top{
      &::after {
        display: none;
      }
    }
  }
}

.wind-pointer {
  transition: transform 0.5s ease-in-out;
}
.hourly-wrapper {
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 20px;
}

.daily-wrapper{
  margin-top: 200px;
  display: flex;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  .day {
    width: 14%;
    padding: 0px 10px;
    &.fadeIn {
      animation: FadeIn .5s ease-out;
      animation-fill-mode: both;
    }
    &:not(:last-child){
      border-right: 1px solid #ffffff55;
    }
    &:nth-child(1) {
      animation-delay: .2s;
    }
    &:nth-child(2) {
      animation-delay: .25s;
    }
    &:nth-child(3) {
      animation-delay: .3s;
    }
    &:nth-child(4) {
      animation-delay: .35s;
    }
    &:nth-child(5) {
      animation-delay: .4s;
    }
    &:nth-child(6) {
      animation-delay: .45s;
    }
    &:nth-child(7) {
      animation-delay: .5s;
    }
    .icon {
      width: 60%;
      margin-left: auto;
      margin-right: auto;
      i {
        height: 130px;
      }
    }
    .temperatures {
      text-align: center;
      font-size: 20px;
    }
    .day-name {
      text-align: center;
      padding-top: 15px;
    }
  }
}
@keyframes FadeIn { 
  0% {
    opacity: 0;
    transform: translateY(400px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
