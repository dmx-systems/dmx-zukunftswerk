<template>
  <div class="zw-workspace">
    <zw-pdf-viewer class="left-panel" v-if="fullscreen" :topic="topic" :src="fileUrl"></zw-pdf-viewer>
    <zw-canvas class="left-panel" v-else></zw-canvas>
    <zw-resizer></zw-resizer>
    <zw-discussion class="right-panel"></zw-discussion>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/doc-util').default,
    require('./mixins/selection').default
  ],

  computed: {

    topic () {
      return this.selectedTopic
    },

    fullscreen () {
      return this.$store.state.fullscreen
    }
  },

  components: {
    'zw-canvas':     require('./zw-canvas').default,
    'zw-discussion': require('./zw-discussion').default,
    'zw-resizer':    require('./zw-resizer').default
  }
}
</script>

<style>
.zw-workspace {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  word-break: break-word;   /* FIXME: long attachment names (discussion panel) still don't break */
                            /* TODO: "break-word" is deprecated
}
</style>
