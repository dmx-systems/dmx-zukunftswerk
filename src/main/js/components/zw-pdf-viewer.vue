<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
pdfjs.GlobalWorkerOptions.workerSrc = '/systems.dmx.zukunftswerk/js/pdf.worker.js'

export default {

  created () {
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
      console.log('Page complete!')
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
</style>
