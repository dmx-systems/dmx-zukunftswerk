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
      const str = zw.getString(this.key)
      return this.value ? this.substitute(str, this.value) : str
    },

    key () {
      return this.$slots.default[0].text
    }
  },

  methods: {
    substitute (str, value) {
      const i = str.indexOf('${}')
      return str.substring(0, i) + value + str.substring(i + 3)
    }
  }
}
</script>
