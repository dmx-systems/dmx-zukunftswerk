<template>
  <div :class="['zw-webclient', {dragging: isDragging}]" @mousedown="mousedown" @mouseup="mouseup" @keyup.tab="tab">
    <zw-header></zw-header>
    <div class="content-area">
      <zw-pdf-viewer class="left-panel" v-if="fullscreen" :src="fileUrl"></zw-pdf-viewer>
      <zw-canvas class="left-panel" v-else></zw-canvas>
      <zw-resizer></zw-resizer>
      <zw-discussion class="right-panel"></zw-discussion>
    </div>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/doc-util').default,
    require('./mixins/dragging').default
  ],

  data() {
    return {
      isPanning: false,     // true while canvas pan is in progress
      panPos: undefined     // temporary mouse pos while canvas pan
    }
  },

  computed: {

    topic () {
      return this.$store.state.topic
    },

    pan () {
      return this.$store.state.pan
    },

    isDragging () {
      return this.$store.state.isDragging
    },

    fullscreen () {
      return this.$store.state.fullscreen
    }
  },

  methods: {

    mousedown (e) {
      // console.log('mousedown', e.target.classList.contains('zw-canvas'), e)
      if (e.target.classList.contains('zw-canvas')) {
        this.$el.addEventListener('mousemove', this.mousemove)
        this.panPos = {
          x: e.clientX,
          y: e.clientY
        }
      }
    },

    mousemove (e) {
      this.$store.dispatch('setPan', {
        x: this.pan.x + e.clientX - this.panPos.x,
        y: this.pan.y + e.clientY - this.panPos.y
      })
      this.panPos.x = e.clientX
      this.panPos.y = e.clientY
      if (!this.isPanning) {
        this.isPanning = true
        this.dragStart()
      }
    },

    mouseup () {
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
    },

    tab () {
      // auto-pan canvas when focus outside viewport while tabbing
      const scrollTop = document.scrollingElement.scrollTop
      // console.log('tab', scrollTop)
      if (scrollTop > 0) {
        document.scrollingElement.scrollTop = 0     // reset browser auto-scroll
        this.$store.dispatch('setPan', {            // ... and compensate with panning
          x: this.pan.x,
          y: this.pan.y - scrollTop
        })
      }
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

.zw-webclient.dragging {
  user-select: none;
}

.zw-webclient .content-area {
  display: flex;
  min-height: 0;
}
</style>
