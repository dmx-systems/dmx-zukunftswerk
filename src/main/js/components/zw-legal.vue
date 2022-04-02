<template>
  <div class="zw-legal">
    <zw-language-switch></zw-language-switch>
    <img :src="logoSrc">
    <zw-string class="heading">{{heading}}</zw-string>
    <div class="scroll-container">
      <zw-string class="text" :html="true">{{text}}</zw-string>
    </div>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/logo').default
  ],

  computed: {

    heading () {
      return 'label.' + this.routeName
    },

    text () {
      return this.routeName
    },

    routeName () {
      return this.router.currentRoute.name
    },

    router () {
      return this.$store.state.routerModule.router
    }
  }
}
</script>

<style>
.zw-legal {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background-color: black;
  background-image: url("../../resources/zw-snake.png");
  background-position: bottom right;
  background-repeat: no-repeat;
  padding: 50px 0 0 120px;
}

.zw-legal img {
  align-self: flex-start;
  margin-left: -81px;
}

.zw-legal .zw-language-switch {
  position: absolute;
  top: 16px;
  right: 16px;
}

.zw-legal .heading {
  color: var(--primary-color);
  font-size: 20px;
  margin-top: 42px;
}

.zw-legal .scroll-container {
  overflow: auto;
  flex-grow: 1;
  margin-top: 24px;
  padding-right: 36%;
}

.zw-legal .text {
  color: white;
}
</style>
