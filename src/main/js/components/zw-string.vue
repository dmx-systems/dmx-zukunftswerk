<template>
  <div class="zw-string" v-if="html" v-html="string"></div>
  <span class="zw-string" v-else>{{string}}</span>
</template>

<script>
import zw from '../zw-globals'

export default {

  props: {
    html: Boolean,
    value: Number
  },

  computed: {

    string () {
      return zw.getString(this.key, this.value)
    },

    key () {
      return this.$slots.default[0].text
    }
  }
}
</script>
