<template>
  <span class="zw-string">{{langString}}</span>
</template>

<script>
export default {

  computed: {

    lang () {
      return this.$store.state.lang
    },

    uiStrings () {
      return this.$store.state.uiStrings
    },

    key () {
      return this.$slots.default[0].text
    },

    langString () {
      return this.uiStrings[this.key + '.' + this.lang]
    }
  }
}
</script>
