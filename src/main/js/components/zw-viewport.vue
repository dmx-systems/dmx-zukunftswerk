<template>
  <div class="zw-viewport">
    <div class="zoom">{{zoomRounded}}</div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  created () {
    this.$emit('actions', [{action: 'action.set_zoom', handler: this.setZoom}])
    this.$emit('resize-style', 'none')
    this.$emit('get-size', () => this.size)
  },

  props: {
    topic: {                  // the Viewport topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  },

  data () {
    return {
      size: {w: 50, h: 50}
    }
  },

  computed: {

    zoom () {
      return this.topic.viewProps['dmx.topicmaps.zoom']
    },

    zoomRounded () {
      return Math.round(100 * this.zoom) / 100
    }
  },

  methods: {
    setZoom () {
      // update client state
      this.topic.setViewProp('dmx.topicmaps.zoom', this.$store.state.zoom)
      // update server state    // TODO: dispatch
      dmx.rpc.setTopicViewProps(this.$store.state.topicmap.id, this.topic.id, {
        'dmx.topicmaps.zoom': this.zoom
      })
    }
  }
}
</script>

<style>
.zw-viewport {
  border-top: 3px solid black;
  border-left: 3px solid black;
  height: 50px;
}

.zw-viewport .zoom {
  margin-top: -20px;
}
</style>
