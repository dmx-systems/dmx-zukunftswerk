export default {
  methods: {
    clearSecondaryPanel () {
      this.$store.dispatch('admin/setSecondaryPanel', undefined)
    }
  }
}
