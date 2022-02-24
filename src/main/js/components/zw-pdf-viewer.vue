<template>
  <div>
    <div>zw-pdf-viewer</div>
    <div>{{src}}</div>
  </div>
</template>

<script>
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
pdfjs.GlobalWorkerOptions.workerSrc = '/systems.dmx.zukunftswerk/js/pdf.worker.js'

export default {

  created () {
    pdfjs.getDocument(this.src).promise.then(pdf => {
      return pdf.getPage(1)
    }).then(page => {
      console.log('page', page)
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
