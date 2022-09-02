<template>
  <div :class="['zw-pdf-viewer', {fullscreen}]">
    <div class="scroll-container">
      <canvas ref="canvas"></canvas>
    </div>
    <div class="toolbar upper" :style="toolbarStyle">
      <el-button type="text" :icon="fullscreenIcon" @click="toggleFullscreen"></el-button>
    </div>
    <div class="toolbar lower" v-if="pagerVisibility" :style="toolbarStyle">
      <el-button type="text" icon="el-icon-arrow-left" @click="prevPage"></el-button>
      <span>{{pageNr}} / {{numPages}}</span>
      <el-button type="text" icon="el-icon-arrow-right" @click="nextPage"></el-button>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
pdfjs.GlobalWorkerOptions.workerSrc = '/systems.dmx.zukunftswerk/pdfjs/pdf.worker.js'

export default {

  created () {
    // console.log('zw-pdf-viewer', this.src)
    this.fetchPDF().then(this.renderPage)
  },

  props: {
    topic: {                // the underlying Document topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    },
    src: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      pdf: undefined        // inited by fetchPDF()
    }
  },

  computed: {

    pageNr () {
      return this.$store.state.pageNr[this.lang][this.topic.id]
    },

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
          'font-size': `${20 / this.zoom}px`
        }
      }
    },

    zoom () {
      return this.$store.state.zoom
    },

    panelX () {
      return this.$store.state.panelX
    },

    fullscreen () {
      return this.$store.state.fullscreen
    },

    lang () {
      return this.$store.state.lang
    },

    fullscreenIcon () {
      return this.fullscreen ? 'el-icon-bottom-left' : 'el-icon-top-right'
    }
  },

  watch: {
    src () {
      // console.log('watch src', this.src)
      this.fetchPDF().then(this.renderPage)
    }
  },

  methods: {

    fetchPDF () {
      this.$emit('loading')
      return pdfjs.getDocument({
        url: this.src,
        cMapUrl: 'cmaps/'
      }).promise.then(pdf => {
        this.pdf = pdf
        this.$store.dispatch('initPageNr', this.topic.id)
        this.$emit('complete')
      })
    },

    renderPage () {
      // console.log('renderPage', this.pageNr)
      return this.pdf.getPage(this.pageNr).then(page => {
        let viewport = page.getViewport({scale: 1})
        if (this.fullscreen) {
          const scale = this.panelX / viewport.width
          viewport = page.getViewport({scale})
        }
        const canvas = this.$refs.canvas
        canvas.width = viewport.width
        canvas.height = viewport.height
        return page.render({
          canvasContext: canvas.getContext('2d'),
          viewport
        }).promise
      })
    },

    prevPage () {
      this.$store.dispatch('prevPage', this.topic.id).then(changed => {
        changed && this.renderPage()
      })
    },

    nextPage () {
      this.$store.dispatch('nextPage', {topicId: this.topic.id, numPages: this.numPages}).then(changed => {
        changed && this.renderPage()
      })
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
  top: 0px;
  right: 0px;
}

.zw-pdf-viewer.fullscreen .toolbar.upper {
  right: 16px;    /* scrollbar pad */
}

.zw-pdf-viewer.fullscreen .toolbar.upper .el-button {
  font-size: 26px;
}

.zw-pdf-viewer .toolbar.lower {
  right: 1px;
  bottom: 4px;
}

.zw-pdf-viewer.fullscreen .toolbar.lower {
  right: 20px;    /* scrollbar pad */
}

.zw-pdf-viewer:hover .toolbar {
  visibility: visible;
}

.zw-pdf-viewer .toolbar .el-button {
  font-size: inherit;
}
</style>
