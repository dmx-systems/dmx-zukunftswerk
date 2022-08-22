/**
 * Note: the host component is expected to hold "topic": a Document topic.
 */
export default {

  computed: {

    file () {
      // Note: empty topics created while edit have ID -1
      const de = this.files.de && this.files.de.id != -1
      const fr = this.files.fr && this.files.fr.id != -1
      if (de && fr) {
        return this.files[this.lang]
      } else if (de) {
        return this.files.de
      } else if (fr) {
        return this.files.fr
      }
    },

    files () {
      return {
        de: this.getFile('de'),
        fr: this.getFile('fr')
      }
    },

    fileUrl () {
      return '/filerepo/' + encodeURIComponent(this.path)
    },

    path () {
      return this.getPath(this.file)
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    getFile (lang) {
      return this.topic.children['dmx.files.file#zukunftswerk.' + lang]
    },

    getPath (file) {
      return this.getPathTopic(file)?.value
    },

    getPathTopic (file) {
      return file?.children['dmx.files.path']
    }
  }
}
