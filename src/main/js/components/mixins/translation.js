import zw from '../../zw-globals'
import errorHandler from '../../error-handler'

export default {
  methods: {
    handleError (error) {
      const message = /java\.lang\.RuntimeException: Unsupported original language: ".." \(detected\)/
      if (error.response.data.cause.match(message)) {
        return this.$confirm(zw.getString('warning.confirm_create'), {
          title:             zw.getString('warning.translation_failed'),
          type: 'warning',
          confirmButtonText: zw.getString('action.create'),
          cancelButtonText:  zw.getString('action.cancel'),
          showClose: false,
        })
      } else {
        errorHandler(error)         // fallback to generic error handler
      }
    }
  }
}
