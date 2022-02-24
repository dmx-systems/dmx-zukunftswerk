<template>
  <div class="zw-pdf-viewer">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
pdfjs.GlobalWorkerOptions.workerSrc = '/systems.dmx.zukunftswerk/js/pdf.worker.js'

export default {

  created () {
    this.$emit('loading')
    pdfjs.getDocument(this.src).promise.then(pdf => {
      return pdf.getPage(1)
    }).then(page => {
      const scale = 1.5
      const viewport = page.getViewport({scale})
      const canvas = this.$refs.canvas
      canvas.width = viewport.width
      canvas.height = viewport.height
      return page.render({
        canvasContext: canvas.getContext('2d'),
        viewport
      }).promise
    }).then(() => {
      this.$emit('complete')
    })
  },

  props: {
    src: {
      type: String,
      required: true
    }
  }
}
</script>

<style>
.zw-pdf-viewer canvas {
  width: 100%;
}
</style>
