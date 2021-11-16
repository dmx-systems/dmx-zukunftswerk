<template>
  <div class="zw-comment">
    <div v-html="this[origLang]"></div>
    <div v-html="this[translatedLang]"></div>
  </div>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  props: {
    comment: Object
  },

  computed: {

    de () {
      return this.comment.children['zukunftswerk.comment.de'].value
    },

    fr () {
      return this.comment.children['zukunftswerk.comment.fr'].value
    },

    origLang () {
      return this.comment.children['zukunftswerk.language#zukunftswerk.original_language'].value
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
</script>

<style>
.zw-comment {
  display: flex;
  column-gap: 12px;
}

.zw-comment > div {
  flex-basis: 50%;
  background-color: white;
}
</style>
