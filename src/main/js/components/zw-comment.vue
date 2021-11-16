<template>
  <div class="zw-comment">
    <div class="label">{{date}}</div>
    <div class="columns">
      <div v-html="this[origLang]"></div>
      <div v-html="this[translatedLang]"></div>
    </div>
  </div>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  created () {
    // console.log(this.comment)
  },

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
    },

    created () {
      return this.comment.children['dmx.timestamps.created'].value
    },

    date () {
      return new Date(this.created).toLocaleString()
    }
  }
}
</script>

<style>
.zw-comment .columns {
  display: flex;
  column-gap: 12px;
}

.zw-comment .columns > div {
  flex-basis: 50%;
  background-color: white;
}
</style>
