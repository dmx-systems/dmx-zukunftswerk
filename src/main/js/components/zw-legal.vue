<template>
  <div class="zw-legal">
    <img class="logo" :src="logoSrc">
    <zw-language-switch></zw-language-switch>
    <h3><zw-string>{{heading}}</zw-string></h3>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/logo').default
  ],

  computed: {

    heading () {
      return 'label.' + this.router.currentRoute.name
    },

    router () {
      return this.$store.state.routerModule.router
    }
  }
}
</script>

<style>
.zw-legal {
}
</style>
