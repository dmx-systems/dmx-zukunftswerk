<template>
  <div class="zw-webclient" :style="{userSelect}">
    <zw-header></zw-header>
    <div class="content-area">
      <zw-canvas></zw-canvas>
      <zw-resizer @resizeStart="resizeStart" @resizeStop="resizeStop"></zw-resizer>
      <zw-discussion></zw-discussion>
    </div>
  </div>
</template>

<script>
export default {

  data() {
    return {
      isResizing: false
    }
  },

  computed: {
    userSelect() {
      return this.isResizing ? 'none' : ''
    }
  },

  methods: {

    resizeStart () {
      this.isResizing = true
    },

    resizeStop () {
      this.isResizing = false
    }
  },

  components: {
    'zw-header':     require('./zw-header').default,
    'zw-canvas':     require('./zw-canvas').default,
    'zw-discussion': require('./zw-discussion').default,
    'zw-resizer':    require('./zw-resizer').default
  }
}
</script>

<style>
.zw-webclient {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.zw-webclient .content-area {
  display: flex;
  height: 95%;    /* FIXME: actually 100% minus header height */
}
</style>
