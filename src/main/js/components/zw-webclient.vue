<template>
  <div class="zw-webclient" :style="style" @mousedown="mousedown" @mouseup="mouseup">
    <zw-header></zw-header>
    <div class="content-area">
      <zw-canvas></zw-canvas>
      <zw-resizer @resizeStart="dragStart" @resizeStop="dragStop"></zw-resizer>
      <zw-discussion></zw-discussion>
    </div>
  </div>
</template>

<script>
export default {

  data() {
    return {
      isDragging: false,    // true while any dragging is in progress (canvas pan or move resizer)
      isPanning: false,     // true while canvas pan is in progress
      panPos: undefined     // temporary mouse pos while canvas pan
    }
  },

  computed: {

    pan () {
      return this.$store.state.pan
    },

    style() {
      if (this.isDragging) {
        return {
          'user-select': 'none'
        }
      }
    }
  },

  methods: {

    mousedown (e) {
      // console.log('mousedown', e.target.classList.contains('zw-canvas'))
      if (e.target.classList.contains('zw-canvas')) {
        this.$el.addEventListener('mousemove', this.mousemove)
        this.panPos = {
          x: e.clientX,
          y: e.clientY
        }
      }
    },

    mousemove (e) {
      this.pan.x += e.clientX - this.panPos.x     // TODO: dispatch action
      this.pan.y += e.clientY - this.panPos.y     // TODO: dispatch action
      this.panPos.x = e.clientX
      this.panPos.y = e.clientY
      if (!this.isPanning) {
        this.isPanning = true
        this.dragStart()
      }
    },

    mouseup () {
      // console.log('mouseup', !!this.panPos)
      if (this.panPos) {
        this.$el.removeEventListener('mousemove', this.mousemove)
      }
      // stop panning
      if (this.isPanning) {
        // console.log('stopPanning')
        this.isPanning = false
        this.panPos = undefined
        this.dragStop()
      }
      // TODO: update sever state?
    },

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
