<template>
    <div v-if="stamp > 0">{{getHours}}:{{getMinutes}}</div>
</template>
<script>
import { setInterval } from 'timers';
export default {
    props: ['time'],
    data () {
        return {
            stamp: 0,
        };
    },
    computed: {
        getHours () {
            return (new Date(this.stamp).getHours() < 10 ? '0' + new Date(this.stamp).getHours() : new Date(this.stamp).getHours());
        },
        getMinutes () {
            return (new Date(this.stamp).getMinutes() < 10 ? '0' + new Date(this.stamp).getMinutes() : new Date(this.stamp).getMinutes());
        },
    },
    updated() {
        console.log("time updated:"+this.time);
        if (this.time !== 0) {
            this.stamp = this.time;
            setInterval(function() {
                this.stamp++;
            }, 1000);
        }
    }
}
</script>