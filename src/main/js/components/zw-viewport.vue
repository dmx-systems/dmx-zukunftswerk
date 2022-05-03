<template>
  <div class="zw-viewport">
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  created () {
    this.$emit('edit-enabled', false)
    this.$emit('resize-style', 'none')
    this.$emit('get-size', () => this.size)
  },

  data () {
    return {
      size: {w: 50, h: 50}
    }
  },

  computed: {
  },

  methods: {
  }
}
</script>

<style>
.zw-viewport {
  border-top: 3px solid black;
  border-left: 3px solid black;
  height: 50px;
}
</style>
