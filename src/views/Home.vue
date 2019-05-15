<template>
  <div class="home">
    <b-row :class="{loading}" align-v="center">
      <b-col sm="6" xs="12">
        <weather-icon :icon="hourlyForecast[selectedHour].icon" />
      </b-col>
      <b-col xs="12">
        <b-row>
          <b-col>
            <h3 class="location-text">{{city}}</h3>
            <h5 class="time-text">
              <span>{{ hourlyForecast[selectedHour].time | moment('timezone', this.timezone, 'HH') }}</span>
              <span class="time-separator" :class="{active: timeSeparator}">:</span>
              <span>{{ hourlyForecast[selectedHour].time | moment('timezone', this.timezone, 'mm') }}</span>
            </h5>
          </b-col>
        </b-row>
        <b-row class="current-info">
          <b-col cols="12" md="auto">
            <h1 class="temperature">{{getTemperature}}</h1>
            <p>{{hourlyForecast[selectedHour].summary}}</p>
          </b-col>
          <b-col class="small-info">
            <p>Feels like: {{getTemperatureFeels}}</p>
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
          <h5>Hourly forecast</h5>
          <vue-slider v-model="selectedHour" :width="'100%'" :marks="sliderMarks" :data="upcomingHours" :tooltip="'none'" @change="hourlyChanged"></vue-slider>
        </b-row>
      </b-col>
    </b-row>
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
      sliderMarks: null,
      upcomingHours: [],
    };
  },
  methods: {
    loadForecast(coords) {
      this.loading = true;
      axios.get(`https://api.skymood.ml/api/forecast?lat=${coords.latitude}&long=${coords.longitude}`)
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
          .filter((val, i) => (i % 2 === 0 && i < 24))
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

          this.sliderMarks = val => val !== this.upcomingHours[0] ? ({
            label: this.$moment(val*1000).tz(this.timezone).format('HH:mm'),
          }) : ({
            label: `Now`,
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
  },
  computed: {
    getTemperature() {
      // Fahrenheit or celsius
      return (this.$store.state.isMetric ? Math.floor(((this.hourlyForecast[this.selectedHour].temperature - 32) * 5 / 9)) + '°C' : Math.floor(this.hourlyForecast[this.selectedHour].temperature) + '°F');
    },
    getTemperatureFeels() {
      // Fahrenheit or celsius
      return (this.$store.state.isMetric ? Math.floor(((this.hourlyForecast[this.selectedHour].temperatureFeels - 32) * 5 / 9)) + '°C' : Math.floor(this.hourlyForecast[this.selectedHour].temperatureFeels) + '°F');
    },
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
.row:not(#loader) {
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
.vue-slider-process {
  background-color: white;
}
.wind-pointer {
  transition: transform 0.5s ease-in-out;
}
.hourly-wrapper {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
