<template>
  <div :class="['zw-webclient', {dragging: isDragging}]" @mousedown="mousedown" @mouseup="mouseup" @keyup.tab="tab">
    <zw-header></zw-header>
    <router-view></router-view>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/dragging').default
  ],

  data() {
    return {
      isPanning: false,     // true while canvas pan is in progress
      panPos: undefined     // temporary mouse pos while canvas pan
    }
  },

  computed: {

    pan () {
      return this.$store.state.pan
    },

    isDragging () {
      return this.$store.state.isDragging
    }
  },

  methods: {

    mousedown (e) {
      // console.log('mousedown', e.target, e.target.classList.contains('zw-canvas'))
      if (e.target.classList.contains('zw-canvas')) {
        this.$el.addEventListener('mousemove', this.mousemove)
        this.panPos = {
          x: e.clientX,
          y: e.clientY
        }
      }
    },

    mousemove (e) {
      this.$store.dispatch('setViewport', {
        pan: {
          x: this.pan.x + e.clientX - this.panPos.x,
          y: this.pan.y + e.clientY - this.panPos.y
        }
      })
      this.panPos.x = e.clientX
      this.panPos.y = e.clientY
      if (!this.isPanning) {
        this.isPanning = true
        this.dragStart()
      }
    },

    mouseup (e) {
      // console.log('mouseup', e.target, this.panPos)
      if (this.panPos) {
        this.$el.removeEventListener('mousemove', this.mousemove)
        if (this.isPanning) {
          // stop panning
          // console.log('stopPanning')
          this.isPanning = false
          this.dragStop()
        // } else {
        //   this.$store.dispatch('deselect')       // Deselection is handled by "selecto" module (TODO)
        }
        this.panPos = undefined
      }
    },

    tab () {
      // auto-pan canvas when focus outside viewport while tabbing
      const scrollTop = document.scrollingElement.scrollTop
      // console.log('tab', scrollTop)
      if (scrollTop > 0) {
        document.scrollingElement.scrollTop = 0     // reset browser auto-scroll
        this.$store.dispatch('setViewport', {       // ... and compensate with panning
          pan: {
            x: this.pan.x,
            y: this.pan.y - scrollTop
          },
          transition: true
        })
      }
    }
  },

  components: {
    'zw-header': require('./zw-header').default
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
</style>
