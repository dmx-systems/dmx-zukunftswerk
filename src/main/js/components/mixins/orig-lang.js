/**
 * Note: the host component is expected to hold "topic": any topic which has an "Original Language" field.
 */
export default {

  computed: {

    origLang () {
      return this.topic.children['zukunftswerk.language#zukunftswerk.original_language'].value
    },

    translatedLang () {
      if (this.origLang === 'de') {
        return 'fr'
      } else if (this.origLang === 'fr') {
        return 'de'
      }
    }
  }
}
