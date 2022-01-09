<template>
  <div class="zw-webclient" :style="style">
    <zw-header></zw-header>
    <div class="content-area">
      <zw-canvas @panStart="dragStart" @panStop="dragStop"></zw-canvas>
      <zw-resizer @resizeStart="dragStart" @resizeStop="dragStop"></zw-resizer>
      <zw-discussion></zw-discussion>
    </div>
  </div>
</template>

<script>
export default {

  data() {
    return {
      isDragging: false
    }
  },

  computed: {
    style() {
      if (this.isDragging) {
        return {
          'user-select': 'none'
        }
      }
    }
  },

  methods: {

    dragStart () {
      this.isDragging = true
    },

    dragStop () {
      this.isDragging = false
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
