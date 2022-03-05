<template>
  <div :class="['zw-pdf-viewer', {fullscreen}]">
    <div class="scroll-container">
      <canvas ref="canvas"></canvas>
    </div>
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
      return this.multipage
    },

    toolbarStyle () {
      if (!this.fullscreen) {
        return {
          'font-size': `${14 / this.zoom}px`      // "14" corresponds to --primary-font-size (see App.vue)
        }
      }
    },

    zoom () {
      return this.$store.state.zoom
    },

    fullscreen () {
      return this.$store.state.fullscreen
    },

    fullscreenIcon () {
      return this.fullscreen ? 'el-icon-bottom-left' : 'el-icon-top-right'
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
      }).then(() => {
        this.$store.dispatch('readPanelXFromView')
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
    },

    toggleFullscreen () {
      this.$store.dispatch('setFullscreen', !this.fullscreen)
    }
  }
}
</script>

<style>
.zw-pdf-viewer {
  position: relative;
}

.zw-pdf-viewer.fullscreen .scroll-container {
  height: 100%;
  overflow: auto;
}

.zw-pdf-viewer .scroll-container canvas {
  width: 100%;
}

.zw-pdf-viewer .toolbar {
  position: absolute;
  visibility: hidden;
  padding: 2px;
  background-color: rgba(255, 255, 255, .7);
}

.zw-pdf-viewer .toolbar.upper {
  top: 4px;
  right: 4px;
}

.zw-pdf-viewer.fullscreen .toolbar.upper {
  right: 16px;
}

.zw-pdf-viewer.fullscreen .toolbar.upper .el-button {
  font-size: 18px;
}

.zw-pdf-viewer .toolbar.lower {
  right: 1px;
  bottom: 4px;
}

.zw-pdf-viewer.fullscreen .toolbar.lower {
  right: 20px;
}

.zw-pdf-viewer:hover .toolbar {
  visibility: visible;
}

.zw-pdf-viewer .toolbar .el-button {
  font-size: inherit;
}
</style>
