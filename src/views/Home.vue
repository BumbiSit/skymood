<template>
  <div class="home">
    <b-row :class="{loading}" align-v="center">
      <b-col sm="6" xs="12">
        <weather-icon :icon="icon"/>
      </b-col>
      <b-col xs="12">
        <b-row>
          <b-col>
            <h3 class="location-text">{{city}}</h3>
            <h5 class="time-text">
              <span>{{ time | moment('timezone', this.timezone, 'HH') }}</span>
              <span class="time-separator" :class="{active: timeSeparator}">:</span>
              <span>{{ time | moment('timezone', this.timezone, 'mm') }}</span>
            </h5>
          </b-col>
        </b-row>
        <b-row class="current-info">
          <b-col cols="12" md="auto">
            <h1 class="temperature">{{getTemperature}}</h1>
            <p>{{summary}}</p>
          </b-col>
          <b-col class="small-info">
            <p>Feels like: {{getTemperatureFeels}}</p>
            <p>Humidity: {{Math.round(humidity*100)}}%</p>
            <p>UV index: {{uvIndex}}</p>
            <p>Chance of rain: {{Math.round(precip*100)}}%</p>
          </b-col>
          <b-col align-self="center">
            <b-row>
              <b-col cols="12" sm="auto"><v-icon name="location-arrow" scale="2" class="wind-pointer"/></b-col>
              <b-col><h3>{{getWindSpeed}}</h3></b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <div id="loader" class="d-flex justify-content-between" :class="{loading}">
        <semipolar-spinner
          :animation-duration="2000"
          :size="100"
          :color="'#fff'"
        />
        <b-row class="justify-content-md-center" style="width:100%;">
          <p v-if="this.currentLat === null">Finding your city...</p>
        </b-row>
    </div>
  </div>
</template>

<script>
import Velocity from 'velocity-animate';
import 'velocity-animate/velocity.ui';
import { SemipolarSpinner } from 'epic-spinners';
import WeatherIcon from '../helpers/WeatherIcon.vue';
import Chart from '../components/Chart.vue';

export default {
  name: 'home',
  components: {
    SemipolarSpinner,
    WeatherIcon,
    Chart,
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
      summary: '',
      temperature: null,
      temperatureFeels: null,
      humidity: null,
      uvIndex: null,
      visibility: null,
      precip: null,
      windDirection: null,
      windSpeed: null,
      icon: '',
      timeSeparator: true,
      hourlyForecast: {
        labels: ['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '0:00',],
        datasets: [{
            label: 'Temperature',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
      },
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
          this.summary = current.summary;
          this.temperature = current.temperature;
          this.temperatureFeels = current.apparentTemperature;
          this.humidity = current.humidity;
          this.uvIndex = current.uvIndex;
          this.visibility = current.visibility;
          this.windDirection = current.windBearing;
          this.windSpeed = current.windSpeed;
          this.icon = current.icon;
          this.precip = current.precipProbability;
          
          Velocity(document.querySelector('.wind-pointer'), 
          {
            rotateZ: `${(this.windDirection-45)}deg`,
          }, 
          {
            duration: 1500,
            easing: [0.3, 0.5, 0.43, 1.01],
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
  },
  computed: {
    getTemperature() {
      // Fahrenheit or celsius
      return (this.$store.state.isMetric ? Math.floor(((this.temperature - 32) * 5 / 9)) + '°C' : Math.floor(this.temperature) + '°F');
    },
    getTemperatureFeels() {
      // Fahrenheit or celsius
      return (this.$store.state.isMetric ? Math.floor(((this.temperatureFeels - 32) * 5 / 9)) + '°C' : Math.floor(this.temperatureFeels) + '°F');
    },
    getVisibility() {
      // Miles or kilometers
      return (this.$store.state.isMetric ? `${Math.floor(this.visibility * 1.609)} km` : `${Math.floor(this.visibility)} mi`);
    },
    getWindSpeed() {
      // Miles or kilomteters
      return (this.$store.state.isMetric ? `${Math.floor(this.windSpeed * 1.609)} kmh` : `${Math.floor(this.windSpeed)} mph`);
    },
    getRandomInt () {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    }
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
    } else {
      this.city = this.currentCity;
      this.loadForecast({
        latitude: this.currentLat,
        longitude: this.currentLng,
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
</style>
