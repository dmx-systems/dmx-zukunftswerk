export default {

  computed: {

    editable () {
      return this.isTeam || this.isEditor
    },

    isTeam () {
      return this.$store.state.isTeam
    },

    isEditor () {
      return this.$store.state.isEditor
    }
  }
}
