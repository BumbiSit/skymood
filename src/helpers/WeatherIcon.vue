<template>
    <b-row class="justify-content-md-center">
            <i :style="`background-image: url(${getIcon});`"></i>
    </b-row>
</template>
<script>
export default {
    props: ['icon', 'static'],
    computed: {
        getIcon() {
            switch (this.icon) {
                case 'clear-day':
                    return (this.static ? require('../assets/icons/day_static.svg') : require('../assets/icons/day.svg'));
                case 'clear-night':
                    return (this.static ? require('../assets/icons/night_static.svg') : require('../assets/icons/night.svg'));
                case 'cloudy':
                    return (this.static ? require('../assets/icons/cloudy_static.svg') : require('../assets/icons/cloudy.svg'));
                case 'partly-cloudy-day':
                    return (this.static ? require('../assets/icons/cloudy-day_static.svg') : require('../assets/icons/cloudy-day.svg'));
                case 'partly-cloudy-night':
                    return (this.static ? require('../assets/icons/cloudy-night_static.svg') : require('../assets/icons/cloudy-night.svg'));
                case 'rain':
                    return (this.static ? require('../assets/icons/rainy_static.svg') : require('../assets/icons/rainy.svg'));
                case 'snow':
                    return (this.static ? require('../assets/icons/snowy_static.svg') : require('../assets/icons/snowy.svg'));
                case 'sleet':
                    return (this.static ? require('../assets/icons/sleet_static.svg') : require('../assets/icons/sleet.svg'));
                case 'fog':
                    return (this.static ? require('../assets/icons/cloudy_static.svg') : require('../assets/icons/cloudy.svg'));
                case 'wind':
                    return (this.static ? require('../assets/icons/windy_static.svg') : require('../assets/icons/windy.svg'));
                default:
                    return (this.static ? require('../assets/icons/day_static.svg') : require('../assets/icons/day.svg'));
            }
        },
    },
};
</script>
<style lang="scss" scoped>
i {
    width: 200px;
    height: 200px;
    background-size: contain;
    background-repeat: no-repeat;
    display: block;
}
</style>
