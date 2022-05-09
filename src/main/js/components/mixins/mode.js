/**
 * Note: the host component is expected to hold render "mode": "info" or "form".
 */
export default {

  computed: {

    infoMode () {
      return this.mode === 'info'
    },

    formMode () {
      return this.mode === 'form'
    }
  }
}
