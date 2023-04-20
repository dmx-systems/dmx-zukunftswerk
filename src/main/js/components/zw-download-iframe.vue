<template>
  <iframe class="zw-download-iframe" :src="url"></iframe>
</template>

<script>
export default {
  computed: {
    url () {
      return this.$store.state.downloadUrl
    }
  }
}
</script>

<style>
.zw-download-iframe {
  display: none;
}
</style>
