export default {

  computed: {

    viewportStyle () {
      return {
        'transform': `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`,
        'transform-origin': 'top left'
      }
    },

    pan () {
      return this.$store.state.pan
    },

    zoom () {
      return this.$store.state.zoom
    }
  }
}
