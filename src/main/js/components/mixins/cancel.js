export default {
  methods: {
    cancel () {
      this.$store.dispatch('cancel', this.topic)
    }
  }
}
