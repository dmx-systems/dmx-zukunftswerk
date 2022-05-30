import zw from '../../zw-globals'
import errorHandler from '../../error-handler'

export default {
  methods: {
    /**
     * @param   msgBox    Optional: 'confirm'/'alert'
     */
    handleError (error, msgBox) {
      const message = /java\.lang\.RuntimeException: Unsupported original language: ".." \(detected\)/
      if (error.response.data.cause.match(message)) {
        switch (msgBox) {
        case 'confirm':
          return this.$confirm(zw.getString('warning.translation_confirm'), {
            title:             zw.getString('warning.translation_failed'),
            type: 'warning',
            confirmButtonText: zw.getString('action.create'),
            cancelButtonText:  zw.getString('action.cancel'),
            showClose: false,
          })
        case 'alert':
          return this.$alert(  zw.getString('warning.translation_alert'), {
            title:             zw.getString('warning.translation_failed'),
            type: 'warning',
            showClose: false,
          })
        }
      }
      errorHandler(error)         // fallback to generic error handler
    }
  }
}
