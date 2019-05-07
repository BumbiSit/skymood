<template>
    <b-row class="justify-content-md-center">
            <i :style="`background-image: url(${getIcon});`"></i>
    </b-row>
</template>
<script>
export default {
    props: ['icon'],
    data() {
        return {
            day: require('../assets/icons/night.svg'),
        };
    },
    computed: {
        getIcon() {
            switch(this.icon) {
                case 'clear-day': 
                    return require('../assets/icons/day.svg');
                    break;
                case 'clear-night':
                    return require('../assets/icons/night.svg');
                    break;
                default:
                    return require('../assets/icons/day.svg');
            }
        },
    },
}
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
