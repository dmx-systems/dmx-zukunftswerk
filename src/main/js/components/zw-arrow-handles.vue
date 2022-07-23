<template>
  <div class="zw-arrow-handles" v-show="visible" :style="zoomStyle">
    <div class="handle" :style="{top: `${h1.y}px`, left: `${h1.x}px`}" ref="h1"></div>
    <div class="handle" :style="{top: `${h2.y}px`, left: `${h2.x}px`}" ref="h2"></div>
  </div>
</template>

<script>
import Moveable from 'moveable'
import zw from '../zw-globals'

let moveable      // Moveable instance of selected arrow

export default {

  mixins: [
    require('./mixins/editable').default,
    require('./mixins/zoom').default
  ],

  mounted () {
    this.m1 = this.newMovable(1, this.$refs.h1)
    this.m2 = this.newMovable(2, this.$refs.h2)
  },

  destroyed () {
    this.m1.destroy()
    this.m2.destroy()
  },

  data () {
    return {
      h1: {x: 0, y: 0},
      h2: {x: 0, y: 0},
      m1: undefined,      // The Moveable instance, initialized on mount
      m2: undefined       // The Moveable instance, initialized on mount
    }
  },

  computed: {

    visible () {
      return this.editable && this.topic?.typeUri === 'zukunftswerk.arrow'
    },

    topic () {
      return this.$store.state.topic
    },

    pos () {
      return this.topic.pos
    },

    width () {
      return this.topic.viewProps['dmx.topicmaps.width']
    },

    angle () {
      return this.topic.viewProps['zukunftswerk.angle'] || 0
    },

    newWidth () {
      return Math.sqrt((this.h1.x - this.h2.x) ** 2 + (this.h1.y - this.h2.y) ** 2)
    },

    newAngle () {
      return 180 * Math.atan2(this.h1.y - this.h2.y, this.h1.x - this.h2.x) / Math.PI
    }
  },

  watch: {
    topic () {
      if (this.visible) {
        moveable = document.querySelector(`.zw-arrow[data-id="${this.topic.id}"]`).__vue__.moveable
        this.updateHandles()
      }
    }
  },

  methods: {

    newMovable (nr, target) {
      const _moveable = new Moveable(this.$el, {
        target,
        draggable: true,
        resizable: false,
        rotatable: false,
        origin: false
      })
      /* draggable */
      _moveable.on("dragStart", ({target, clientX, clientY}) => {
        // this.select()     // programmatic selection
      }).on("drag", ({
        target, transform, left, top, right, bottom, beforeDelta, beforeDist, delta, dist, clientX, clientY
      }) => {
        // store old model
        const oldPos = {
          x: this[`h${nr}`].x,
          y: this[`h${nr}`].y
        }
        const oldWidth = this.newWidth
        // update model
        this[`h${nr}`].x = left
        this[`h${nr}`].y = top
        this.topic.setViewProp('dmx.topicmaps.width', this.newWidth)
        this.topic.setViewProp('zukunftswerk.angle', this.newAngle)
        // position correction
        const newPos = this[`h${nr}`]
        this.topic.setPosition({
          x: this.pos.x + (newPos.x - oldPos.x - this.newWidth + oldWidth) / 2,
          y: this.pos.y + (newPos.y - oldPos.y) / 2
        })
        // update view
        this.$nextTick(() => {
          moveable.updateTarget()
        })
      }).on("dragEnd", ({target, isDrag, clientX, clientY}) => {
        this.$store.dispatch('storeArrowHandles', this.topic)
      })
      //
      return _moveable
    },

    updateHandles () {
      const alpha = Math.PI * this.angle / 180
      const sin = Math.sin(alpha)
      const cos = Math.cos(alpha)
      const cx = this.pos.x + this.width / 2
      const cy = this.pos.y + zw.ARROW_HEIGHT / 2
      const w2 = this.width / 2
      const w2sin = w2 * sin
      const w2cos = w2 * cos
      this.h1.x = cx + w2cos
      this.h1.y = cy + w2sin
      this.h2.x = cx - w2cos
      this.h2.y = cy - w2sin
    }
  }
}
</script>

<style>
.zw-arrow-handles .handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background-color: #4af  /* TODO: var(--highlight-color) */;
  border: 2px solid white;
  border-radius: 50%;
  box-sizing: border-box;
  margin-top: -7px;
  margin-left: -7px;
  z-index: 10;
  cursor: move;
}
</style>
