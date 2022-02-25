<template>
  <span v-if="truncated">{{truncated}}</span>
  <span v-else v-html="html" ref="html"></span>
</template>

<script>
const LIMIT = 120

export default {

  mounted () {
    this.truncate()
  },

  props: {
    html: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      truncated: undefined
    }
  },

  watch: {
    html () {
      this.truncated = undefined
      this.$nextTick(this.truncate)
    }
  },

  methods: {
    truncate () {
      let text = this.$refs.html.innerText
      if (text.length > LIMIT) {
        const i = text.lastIndexOf(' ', LIMIT)
        if (i >= 0) {
          text = text.substring(0, i + 1) + '...'
        }
      }
      this.truncated = text
    }
  }
}
</script>
