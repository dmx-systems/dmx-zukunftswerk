<template>
  <div class="zw-arrow-layer" v-show="visible">
    <div class="handle" :style="{top: `${h1.y}px`, left: `${h1.x}px`}" ref="h1"></div>
    <div class="handle" :style="{top: `${h2.y}px`, left: `${h2.x}px`}" ref="h2"></div>
  </div>
</template>

<script>
import Moveable from 'moveable'

export default {

  created () {
    console.log('created')
  },

  mounted () {
    console.log('mounted')
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
      m1: undefined,      // The Moveable instance
      m2: undefined       // The Moveable instance
    }
  },

  computed: {

    visible () {
      console.log('visible', this.topic?.typeUri === 'zukunftswerk.arrow')
      return this.topic?.typeUri === 'zukunftswerk.arrow'
    },

    topic () {
      return this.$store.state.topic
    },

    p1 () {
      return this.topic && {
        x: this.topic.viewProps['zukunftswerk.x1'],
        y: this.topic.viewProps['zukunftswerk.y1']
      }
    },

    p2 () {
      return this.topic && {
        x: this.topic.viewProps['zukunftswerk.x2'],
        y: this.topic.viewProps['zukunftswerk.y2']
      }
    }
  },

  watch: {
    topic () {
      // TODO
    }
  },

  methods: {
    newMovable (nr, target) {
      const moveable = new Moveable(document.querySelector('.zw-arrow-layer'), {
        target,
        draggable: true,
        resizable: false,
        rotatable: false,
        origin: false
      })
      /* draggable */
      moveable.on("dragStart", ({target, clientX, clientY}) => {
        console.log('dragStart')
        // this.select()     // programmatic selection
      }).on("drag", ({
        target, transform, left, top, right, bottom, beforeDelta, beforeDist, delta, dist, clientX, clientY
      }) => {
        // console.log('drag', transform, left, top)
        this[`h${nr}`].x = left
        this[`h${nr}`].y = top
        // TODO
      }).on("dragEnd", ({target, isDrag, clientX, clientY}) => {
        console.log('dragEnd')
        // this.dragEnd()
        // this.storePos()
      })
      //
      return moveable
    }
  }
}
</script>

<style>
.zw-arrow-layer {
}

.zw-arrow-layer .handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background-color: var(--highlight-color);
  border: 2px solid white;
  border-radius: 50%;
  box-sizing: border-box;
  margin-top: -7px;
  margin-left: -7px;
  z-index: 10;
}
</style>
