<template>
    <div class="wrapper" :class="{shown: shown}">
        <b-row align-v="center" no-gutters>
            <b-col cols="12" sm="auto" class="text-center">
                <h2>SkyMood</h2>
                <div class="side-tools d-block d-sm-none">
                    <router-link to="/" v-b-tooltip.hover title="My location">
                        <v-icon name="regular/compass" scale="1.5"/>
                    </router-link>
                    <span class="switch-measurements" v-b-tooltip.hover title="Change measurement" @click="$store.commit('changeMeasurement', !$store.state.isMetric)">{{!$store.state.isMetric ? '°C' : '°F'}}</span>
                </div>
            </b-col>
            <b-col>
                <b-input-group left="@">
                    <b-form-input
                        class="mr-sm-2 location-search"
                        :class="{active: isAutocomleteVisible}"
                        placeholder="What mood does the sky have in..."
                        id="location"
                    ></b-form-input>
                </b-input-group>
            </b-col>
            <b-col cols="1" class="d-none d-sm-block">
                <router-link to="/" v-b-tooltip.hover title="My location">
                    <v-icon name="regular/compass" scale="1.5"/>
                </router-link>
                <span class="switch-measurements" v-b-tooltip.hover title="Change measurement" @click="$store.commit('changeMeasurement', !$store.state.isMetric)">{{!$store.state.isMetric ? '°C' : '°F'}}</span>
            </b-col>
        </b-row>
    </div>
</template>
<script>
export default {
    props: ['time'],
    data() {
        return {
            shown: false,
            autocomplete: '',
            isAutocomleteVisible: false,
            stamp: this.time,
        };
    },
    methods: {
        submit() {
            // document.getElementsByClassName('pac-item')[0].classList.add('pac-item-selected');
        },
    },
    updated() {
        this.stamp = this.time;
    },
    mounted() {
        const performAnimation = () => {
            this.shown = true;
        };
        requestAnimationFrame(performAnimation);

        // Initialize Google Maps Autocomplete search box
        this.autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('location'),
            {
                types: ['(cities)'],
            },
        );
        // Listen for when user chooses a legitamate location
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace();
            if (typeof place.geometry !== 'undefined') {
                let city = String;
                let country = String;
                place.address_components.forEach((v) => {
                    if (v.types.includes('locality')) city = v.long_name;
                    if (v.types.includes('country')) country = v.long_name;
                });
                const lat = place.geometry.location.lat();
                const lon = place.geometry.location.lng();
                this.$emit('choseCity', {
                    lat,
                    lon,
                    address: `${city}, ${country}`,
                });
            }
        });

        const self = this;
        setTimeout(() => {
            const pac = document.querySelector('.pac-container');
            pac.classList.remove('pac-logo');

            // Select the node that will be observed for mutations
            const targetNode = pac;
            // Options for the observer (which mutations to observe)
            const config = { attributes: true };
            // Callback function to execute when mutations are observed
            const callback = (mutationsList) => {
                mutationsList.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                        if (window.getComputedStyle(pac).getPropertyValue('display') === 'block') self.isAutocomleteVisible = true;
                        else self.isAutocomleteVisible = false;
                    }
                });
            };
            new MutationObserver(callback).observe(targetNode, config);
        }, 500);
    },
};
</script>
<style lang="scss" scoped>
.wrapper{
    transform: translateY(-50px);
    opacity: 0;
    transition: all 0.7s cubic-bezier(.17, .67, .3, 1);
    &.shown{
        opacity: 1;
        transform: translateY(10px);
    }
}
.navbar-dark .navbar-brand{
    font-size: 2em;
    font-weight: 300;
}
.side-tools{
    position: absolute;
    right: 20px;
    top: 0;
}
.location-search{
    border-radius: 20px;
    padding: 5px 20px;
    background-color: #ffffff33;
    color: white;
    font-weight: 500;
    margin-left: 20px;
    margin-right: 20px !important;
    &::placeholder{
        color: white;
    }
    &.active{
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
    }
}
.form-inline{
    width: 100%;
    justify-content: center;
    .input-group{
        width: 90%;
    }
}
.switch-measurements {
    display: inline-block;
    padding-left: 10px;
    font-size: 20px;
    cursor: pointer;
}
</style>
