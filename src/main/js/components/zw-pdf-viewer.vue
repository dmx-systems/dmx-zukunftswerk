<template>
  <div>
    <div>zw-pdf-viewer</div>
    <div>{{src}}</div>
  </div>
</template>

<script>
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
console.log('pdfjs', pdfjs)

export default {
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
