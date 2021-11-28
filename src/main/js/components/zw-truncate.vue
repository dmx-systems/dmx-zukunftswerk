<template>
  <span v-if="truncated">{{truncated}}</span>
  <span v-else v-html="html" ref="html"></span>
</template>

<script>
const LIMIT = 70

export default {

  mounted () {
    let text = this.$refs.html.innerText
    if (text.length > LIMIT) {
      const i = text.lastIndexOf(' ', LIMIT)
      if (i >= 0) {
        text = text.substring(0, i + 1) + '...'
      }
    }
    this.truncated = text
  },

  data () {
    return {
      truncated: undefined
    }
  },

  props: {
    html: {
      type: String,
      required: true
    }
  }
}
</script>
