<template>
    <div class="wrapper" :class="{shown: shown}">
        <b-navbar variant="faded" type="dark">
            <b-navbar-brand href="#">SkyMood</b-navbar-brand>
            <b-nav-form @submit.prevent="()=>{return true}">
                <b-input-group left="@">
                    <b-form-input
                        class="mr-sm-2 location-search"
                        :class="{active: isAutocomleteVisible}"
                        placeholder="What mood does the sky have in..."
                        id="location"
                    ></b-form-input>
                </b-input-group>
            </b-nav-form>
        </b-navbar>
    </div>
</template>
<script>


export default {
    data() {
        return {
            shown: false,
            autocomplete: '',
            isAutocomleteVisible: false,
        };
    },
    methods: {
        submit() {
            // document.getElementsByClassName('pac-item')[0].classList.add('pac-item-selected');
        },
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
                const lat = place.geometry.location.lat();
                const lon = place.geometry.location.lng();
                console.log(`Coordinates ${lat}, ${lon}`);
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
        }, 300);
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
        transform: translateY(0);
    }
}
.navbar-dark .navbar-brand{
    font-size: 2em;
    font-weight: 300;
}
.location-search{
    border-radius: 20px;
    padding: 5px 20px;
    background-color: #ffffff33;
    color: white;
    font-weight: 500;
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

</style>
