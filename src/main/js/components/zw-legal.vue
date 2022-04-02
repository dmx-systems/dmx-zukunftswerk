<template>
  <div class="zw-legal">
    <div class="header">
      <img :src="logoSrc">
      <zw-language-switch></zw-language-switch>
    </div>
    <div>
      <div class="heading">
        <zw-string>{{heading}}</zw-string>
      </div>
      <div class="text">
        <zw-string>{{text}}</zw-string>
      </div>
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
  padding: 60px 0 10px 160px;
}

.zw-legal .header {
  margin-left: -81px;
}

.zw-legal .header img {
  vertical-align: top;
  margin-right: 180px;
}

.zw-legal .heading {
  color: var(--primary-color);
  font-size: 20px;
  margin-top: 42px;
}

.zw-legal .text {
  color: white;
  margin-top: 16px;
}
</style>
