<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 100" class="zw-arrow">
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#909399" />
      </marker>
    </defs>
    <line x1="0" y1="50" x2="250" y2="50" stroke="#909399" stroke-width="8" marker-end="url(#arrowhead)" />
  </svg>
</template>

<script>
import dmx from 'dmx-api'

export default {

  props: {
    topic: {                  // the Arrow topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  }
}
</script>

<style>
.zw-arrow {
  max-width: 200px;
}
</style>
