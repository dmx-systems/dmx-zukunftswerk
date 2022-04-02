<template>
  <div v-if="html" class="zw-string" v-html="string"></div>
  <span v-else class="zw-string">{{string}}</span>
</template>

<script>
import zw from '../zw-globals'

export default {

  props: {
    html: Boolean
  },

  computed: {

    string () {
      return zw.getString(this.key)
    },

    key () {
      return this.$slots.default[0].text
    }
  }
}
</script>
