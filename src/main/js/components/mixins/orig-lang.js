/**
 * Note: the host component is expected to hold "topic": any topic which has an "Original Language" field.
 */
export default {

  computed: {

    // lang to be rendered in left column
    lang1 () {
      return this.origLang || 'de'
    },

    // lang to be rendered in right column
    lang2 () {
      return this.translatedLang || 'fr'
    },

    origLang () {
      // Note: a monolingual topic has no "Original Language", "origLang" is undefined then
      return this.topic.children['zukunftswerk.language#zukunftswerk.original_language']?.value
    },

    // Note: for a monolingual topic "translatedLang" is undefined
    translatedLang () {
      if (this.origLang === 'de') {
        return 'fr'
      } else if (this.origLang === 'fr') {
        return 'de'
      }
    }
  }
}
