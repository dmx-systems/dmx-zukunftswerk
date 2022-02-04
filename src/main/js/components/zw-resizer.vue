<template>
  <div class="zw-resizer" :style="{left: left + 'px'}" v-if="visible" @mousedown="onMouseDown"></div>
</template>

<script>
export default {

  created () {
    this.$store.watch(state => state.panelVisibility, visible => {
      if (visible) {
        this.$nextTick(() => {
          this.resize()
        })
      }
    })
    //
    window.addEventListener('resize', e => {
      if (this.visible) {
        // read state from view
        this.$store.dispatch('setPanelX', document.querySelector('.zw-canvas').clientWidth)
      }
    })
  },

  mounted () {
    this.resize()
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
      const left = this.left
      const {addEventListener, removeEventListener} = window

      this.$emit('resizeStart')

      const onMouseMove = ({pageX}) => {
        this.$store.dispatch('setPanelX', left + pageX - initialPageX)
        this.resize()
      }

      const onMouseUp = () => {
        removeEventListener('mousemove', onMouseMove)
        removeEventListener('mouseup',   onMouseUp)
        this.$emit('resizeStop')
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
