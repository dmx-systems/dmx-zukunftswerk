<template>
  <div class="zw-note" v-html="html" :style="style"></div>
</template>

<script>
export default {

  props: {
    topic: Object
  },

  computed: {

    html () {
      const text = this.topic.children['dmx.notes.text']
      return text && text.value
    },

    style () {
      const pos = this.topic.getPosition()
      return {
        top:  `${pos.y}px`,
        left: `${pos.x}px`,
      }
    }
  }
}
</script>

<style>
.zw-note {
  position: absolute;
  min-width: 120px;
  max-width: 420px;
  padding: 8px;
  background-color: rgb(255, 250, 109);
}
</style>
