export default {

  computed: {

    logoSrc () {
      return this.logo[this.lang]
    },

    logo () {
      return this.$store.state.logo
    },

    lang () {
      return this.$store.state.lang
    }
  }
}
