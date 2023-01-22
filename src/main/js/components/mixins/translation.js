import zw from '../../zw-globals'

/**
 * Note: the host component is expected to hold
 * - topic        any topic which has an "Original Language" field (dmx.ViewTopic)
 * - type         base URI of topic's type, e.g. 'zukunftswerk.note'
 * - topicBuffer  the buffer used for topic editing (dmx.ViewTopic)
 */
export default {

  mixins: [
    require('./error-handling').default
  ],

  data () {
    return {
      translation: '',        // last translation result
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

    translationEdited () {
      return this.topic.children['zukunftswerk.translation_edited']?.value
    },

    editFlag () {
      const uri = `${this.type}.${this.lang2}`
      if (this.translation) {
        return this.translation !== this.topicBuffer.children[uri].value
      } else {
        if (this.translationEdited) {
          return true
        } else {
          return this.topic.children[uri].value !== this.topicBuffer.children[uri].value
        }
      }
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
    },

    // 3 translation modes: "automatic", "edited", "none"

    automatic () {
      return this.origLang && !this.translationEdited
    },

    edited () {
      return this.origLang && this.translationEdited
    },

    none () {
      return !this.origLang
    },

    translationMode () {
      const suffix = this.automatic ? 'automatic' : this.edited ? 'edited' : 'none'
      return zw.getString('label.' + suffix)
    },

    translateTooltip () {
      return zw.getString('tooltip.translate')
    }
  },

  methods: {
    translate () {
      // TODO: send target lang if known
      this.translating = true
      return this.$store.dispatch('translate', this.model[this.lang1].value).then(translation => {
        // TODO: process detected lang
        this.model[this.lang2].value = translation.text
        this.translation = translation.text
        return translation
      }).catch(error => {
        return this.handleError(error, 'alert')
      }).finally(() => {
        this.translating = false
      })
    }
  }
}
