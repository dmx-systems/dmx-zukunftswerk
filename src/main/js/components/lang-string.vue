<template>
  <span class="lang-string">{{langString}}</span>
</template>

<script>
export default {

  computed: {

    lang () {
      return this.$store.state.lang
    },

    langStrings () {
      return this.$store.state.langStrings
    },

    key () {
      return this.$slots.default[0].text
    },

    langString () {
      return this.langStrings[this.key + '.' + this.lang]
    }
  }
}
</script>
