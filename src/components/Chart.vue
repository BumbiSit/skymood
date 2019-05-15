<template>
    <div class="chart-wrapper" :style="{width: '100%', height: height+'px'}">
        <div class="bar" v-for="(value, i) in values" :key="i" :style="{height: (value.value/getMaxValue*100)+'%'}">
            <span class="val">{{value.value}}</span>
            <span class="lbl">{{value.label}}</span>
        </div>
    </div>
</template>
<script>
export default {
    props: ['values', 'height'],
    computed: {
        getMaxValue() {
            return Math.max(...this.values.map((val) => {
                return val.value;
            }));
        }
    },
    mounted() {
        console.log(this.getMaxValue);
    },
}
</script>
<style lang="scss">
.chart-wrapper {
    display: flex;
    justify-content: space-around;
    padding-top: 20px;
    align-items: baseline;
}
.bar {
    width: 15px;
    background-color: #ffffff;
    border-top-left-radius: 10px;
    position: relative;
    border-top-right-radius: 10px;
    transition: all 0.3s ease-out;
    .val {
        position: absolute;
        top: -25px;
    }
    .lbl {
        position: absolute;
        bottom: -25px;
        transform: translateX(-25%);
    }
}

</style>
