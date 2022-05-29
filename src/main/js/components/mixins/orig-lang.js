/**
 * Note: the host component is expected to hold "topic": any topic which has an "Original Language" field.
 */
export default {

  data () {
    return {
      translating: false      // true while translation is in progress
    }
  },

  computed: {

    model () {
      return {
        de: this.topicBuffer.children[`${this.type}.de`],
        fr: this.topicBuffer.children[`${this.type}.fr`]
      }
    },

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
  },

  methods: {
    translate () {
      // TODO: send target lang if known
      this.translating = true
      return this.$store.dispatch('translate', this.model[this.lang1].value).then(translation => {
        // TODO: process detected lang
        this.model[this.lang2].value = translation.text
        return translation
      }).catch(error => {
        return this.handleError(error, 'alert')
      }).finally(() => {
        this.translating = false
      })
    }
  }
}
