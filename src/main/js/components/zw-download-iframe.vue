<template>
  <iframe class="zw-download-iframe" :src="url" @load="load"></iframe>
</template>

<script>
export default {
  computed: {
    url () {
      return this.$store.state.downloadUrl
    }
  },

  methods: {
    load (e) {
      console.log('### load', e)
      e.preventDefault()
    }
  }
}
</script>

<style>
.zw-download-iframe {
  display: none;
}
</style>
