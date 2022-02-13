export default {

  methods: {

    dragStart () {
      this.$store.dispatch('dragStart')
    },

    dragStop () {
      this.$store.dispatch('dragStop')
    }
  }
}
