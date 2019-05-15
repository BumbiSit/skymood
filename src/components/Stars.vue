<template>
    <div id="stars" :class="{on: loaded}">
        <div class="star" v-for="n in starCount" v-bind:key="n"></div>
    </div>
</template>

<script>
export default {
  props: ['count'],
  data() {
    return {
      starCount: this.count,
      loaded: false,
    };
  },
  mounted() {
    document.querySelectorAll('.star').forEach((element) => {
      const el = element;
      el.style.left = `${Math.floor(Math.random() * window.innerWidth)}px`;
      el.style.top = `${Math.floor(Math.random() * (window.innerHeight))}px`;
    });
    setTimeout(() => { this.loaded = true; }, 100);
  },
};
</script>

<style lang="scss" scoped>
#stars{
  width: 100%;
  height: 100%;
  top: 0;
  opacity: 0;
  transition: all 1s ease-in-out;
  &.on{
    top: -50%;
    opacity: 1;
  }
}
.star{
    position: absolute;
    width: 1px;
    height: 1px;
    background-color: #ffffff;
    box-shadow: 0px 0px 2px rgba(255, 255, 255, 0.4);
}
</style>
