<template>
  <div class="zw-resizer" :style="{left: left + 'px'}" v-if="visible" @mousedown="onMouseDown"></div>
</template>

<script>
export default {

  created () {
    this.$store.watch(state => state.panelVisibility, visible => {
      this.$nextTick(() => {
        if (visible) {
          this.resize()
        }
      })
    })
    //
    window.addEventListener('resize', e => {
      // read state from view
      if (this.visible) {
        this.$store.dispatch('setPanelX', document.querySelector('.zw-canvas').clientWidth)
      }
    })
  },

  computed: {

    visible () {
      return this.$store.state.panelVisibility
    },

    left () {
      return this.$store.state.panelX
    }
  },

  methods: {

    onMouseDown ({pageX: initialPageX}) {
      const self = this
      const left = self.left
      const {addEventListener, removeEventListener} = window

      this.$emit('resizeStart')

      const onMouseMove = function ({pageX}) {
        self.$store.dispatch('setPanelX', left + pageX - initialPageX)
        self.resize()
      }

      const onMouseUp = function () {
        removeEventListener('mousemove', onMouseMove)
        removeEventListener('mouseup',   onMouseUp)
        self.$emit('resizeStop')
      }

      addEventListener('mousemove', onMouseMove)
      addEventListener('mouseup', onMouseUp)
    },

    // Public API

    /**
     * Updates view according to model (store.state.panelX)
     */
    resize () {
      const container = document.querySelector('.zw-webclient')
      const paneL     = document.querySelector('.zw-canvas')
      const paneR     = document.querySelector('.zw-discussion')
      const paneLWidth = this.left
      const paneRWidth = container.clientWidth - paneLWidth
      paneL.style.width = `${paneLWidth}px`
      paneR.style.width = `${paneRWidth}px`
    }
  }
}
</script>

<style>
.zw-resizer {
  position: absolute;
  width: 16px;
  height: 100%;
  margin-left: -8px;    /* -width / 2 */
  z-index: 2;           /* make it appear before discussion panel */
  cursor: col-resize;
  /* background-color: rgba(255, 0, 0, .3); */
}
</style>
