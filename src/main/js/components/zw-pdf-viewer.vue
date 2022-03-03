<template>
  <div class="zw-pdf-viewer">
    <canvas ref="canvas"></canvas>
    <div class="toolbar upper" :style="toolbarStyle">
      <el-button type="text" :icon="fullscreenIcon" @click="toggleFullscreen"></el-button>
    </div>
    <div class="toolbar lower" v-if="pagerVisibility" :style="toolbarStyle">
      <el-button type="text" icon="el-icon-arrow-left" @click="prev"></el-button>
      <span>{{pageNr}} / {{numPages}}</span>
      <el-button type="text" icon="el-icon-arrow-right" @click="next"></el-button>
    </div>
  </div>
</template>

<script>
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
pdfjs.GlobalWorkerOptions.workerSrc = '/systems.dmx.zukunftswerk/js/pdf.worker.js'

export default {

  created () {
    this.fetchPDF()
  },

  props: {
    src: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      pdf: undefined,
      pageNr: undefined
    }
  },

  computed: {

    numPages () {
      return this.pdf?.numPages
    },

    multipage () {
      return this.numPages > 1
    },

    pagerVisibility () {
      return this.multipage && !this.fullscreen
    },

    toolbarStyle () {
      return {
        'font-size': `${14 / this.zoom}px`      // "14" corresponds to --primary-font-size (see App.vue)
      }
    },

    zoom () {
      return this.$store.state.zoom
    },

    fullscreenIcon () {
      return this.fullscreen ? 'el-icon-bottom-left' : 'el-icon-top-right'
    },

    fullscreen () {
      return this.$store.state.fullscreen
    }
  },

  watch: {

    pageNr () {
      this.renderPage()
    },

    src () {
      const pageNr = this.pageNr
      this.fetchPDF().then(() => {
        if (pageNr == 1) {      // if previous page is != 1 page is already rendered by fetchPDF() (via pageNr watcher)
          this.renderPage()
        }
      })
    }
  },

  methods: {

    fetchPDF () {
      this.$emit('loading')
      return pdfjs.getDocument(this.src).promise.then(pdf => {
        this.pdf = pdf
        this.pageNr = 1
        this.$emit('complete')
      })
    },

    renderPage () {
      return this.pdf.getPage(this.pageNr).then(page => {
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

    toggleFullscreen () {
      this.$store.dispatch('setFullscreen', !this.fullscreen)
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
.zw-pdf-viewer {
  position: relative;
}

.zw-pdf-viewer canvas {
  width: 100%;
}

.zw-pdf-viewer .toolbar {
  position: absolute;
  visibility: hidden;
  padding: 2px;
  background-color: rgba(255, 255, 255, .7);
}

.zw-pdf-viewer .toolbar.upper {
  right: 4px;
  top: 4px;
}

.zw-pdf-viewer .toolbar.lower {
  right: 1px;
  bottom: 4px;
}

.zw-pdf-viewer:hover .toolbar {
  visibility: visible;
}

.zw-pdf-viewer .toolbar .el-button {
  font-size: inherit;
}
</style>
