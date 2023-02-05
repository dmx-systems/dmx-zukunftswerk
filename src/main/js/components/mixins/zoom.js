export default {

  computed: {

    buttonStyle () {
      return {
        'font-size': `${14 / this.zoom}px`      // "14" matches --primary-font-size (see App.vue)
      }
    },

    zoom () {
      return this.$store.state.zoom
    }
  }
}
