import zw from '../../zw-globals'

export default {

  computed: {

    logo () {
      return zw.logo[this.lang]
    },

    lang () {
      return this.$store.state.lang
    }
  }
}
