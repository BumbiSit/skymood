<template>
    <b-row class="justify-content-md-center">
            <i :style="`background-image: url(${getIcon});`"></i>
    </b-row>
</template>
<script>
export default {
    props: ['icon'],
    computed: {
        getIcon() {
            switch (this.icon) {
                case 'clear-day':
                    return require('../assets/icons/day.svg');
                case 'clear-night':
                    return require('../assets/icons/night.svg');
                case 'cloudy':
                    return require('../assets/icons/cloudy.svg');
                case 'partly-cloudy-day':
                    return require('../assets/icons/cloudy-day-1.svg');
                case 'partly-cloudy-night':
                    return require('../assets/icons/cloudy-night-1.svg');
                case 'rain':
                    return require('../assets/icons/rainy-5.svg');
                case 'wind':
                    return require('../assets/icons/rainy-6.svg');
                default:
                    return require('../assets/icons/day.svg');
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
