/**
 * Note: the host component is expected to hold "topic": any topic which has an "Original Language" field.
 */
export default {

  computed: {

    origLang () {
      // Note: a monolingual comment has no "Original Language", "origLang" is undefined then
      return this.topic.children['zukunftswerk.language#zukunftswerk.original_language']?.value
    },

    // Note: for a monolingual comment "translatedLang" is undefined
    translatedLang () {
      if (this.origLang === 'de') {
        return 'fr'
      } else if (this.origLang === 'fr') {
        return 'de'
      }
    }
  }
}
