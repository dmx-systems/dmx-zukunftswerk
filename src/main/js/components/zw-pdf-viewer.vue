<template>
  <div class="zw-pdf-viewer">
    <canvas ref="canvas"></canvas>
    <div class="toolbar">
      <el-button type="text" icon="el-icon-arrow-left" @click="prev"></el-button>
      <el-input class="page" v-model="pageNr"></el-input> / {{numPages}}
      <el-button type="text" icon="el-icon-arrow-right" @click="next"></el-button>
    </div>
  </div>
</template>

<script>
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
pdfjs.GlobalWorkerOptions.workerSrc = '/systems.dmx.zukunftswerk/js/pdf.worker.js'

export default {

  props: {
    src: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      pdf: undefined,
      pageNr: 1
    }
  },

  computed: {
    numPages () {
      return this.pdf?.numPages
    }
  },

  created () {
    this.$emit('loading')
    pdfjs.getDocument(this.src).promise.then(pdf => {
      this.pdf = pdf
      return this.renderPage()
    }).then(() => {
      this.$emit('complete')
    })
  },

  watch: {
    pageNr () {
      this.renderPage()
    }
  },

  methods: {

    renderPage () {
      this.pdf.getPage(this.pageNr).then(page => {
        const scale = 1.5
        const viewport = page.getViewport({scale})
        const canvas = this.$refs.canvas
        canvas.width = viewport.width
        canvas.height = viewport.height
        return page.render({
          canvasContext: canvas.getContext('2d'),
          viewport
        }).promise
      })
    },

    prev () {
      if (this.pageNr > 1) {
        this.pageNr--
      }
    },

    next () {
      if (this.pageNr < this.numPages) {
        this.pageNr++
      }
    }
  }
}
</script>

<style>
.zw-pdf-viewer canvas {
  width: 100%;
}

.zw-pdf-viewer .toolbar .page {
  width: 50px;
}
</style>
