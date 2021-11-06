<template>
  <div class="zw-document">
    Document
    <pre v-if="isText">{{text}}</pre>
    <img v-if="isImage" :src="fileUrl" @load="update">
    <audio v-if="isAudio" :src="fileUrl" controls></audio>
    <video v-if="isVideo" :src="fileUrl" controls @loadeddata="update"></video>
    <embed v-if="isPDF" :src="fileUrl" :type="mediaType" class="pdf" @load="update"></embed>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  created () {
    console.log('zw-document', this.path)
    this.initText()
  },

  props: {
    topic: {
      type: dmx.ViewTopic,    // the Document topic (dmx.ViewTopic)
      required: true
    }
  },

  data () {
    return {
      text: ''
    }
  },

  computed: {

    lang () {
      return this.$store.state.lang
    },

    path () {
      return this.val(this.getPath)
    },

    mediaType () {
      const file = this.val(this.getFile)
      if (file) {
        const mediaType = file.children['dmx.files.media_type']
        return mediaType && mediaType.value
      }
    },

    fileUrl () {
      return '/filerepo/' + encodeURIComponent(this.path)
    },

    isText () {
      return this.mediaType && this.mediaType.startsWith('text/')
    },

    isImage () {
      return this.mediaType && this.mediaType.startsWith('image/')
    },

    isAudio () {
      return this.mediaType && this.mediaType.startsWith('audio/')
    },

    isVideo () {
      return this.mediaType && this.mediaType.startsWith('video/')
    },

    isPDF () {
      return this.mediaType === 'application/pdf'
    }
  },

  watch: {
    topic () {
      this.initText()
    }
  },

  methods: {

    update() {
      // console.log("update")
      // this.context.updated()   ### TODO
    },

    initText () {
      if (this.isText) {
        this.$store.dispatch('getFileContent', this.path).then(content => {
          this.text = content
        })
      }
    },

    getFile (lang) {
      return this.topic.children['dmx.files.file#zukunftswerk.' + lang]
    },

    getPath (lang) {
      const file = this.getFile(lang)
      return file && file.children['dmx.files.path'].value
    },

    val (func) {
      const val = {
        de: func('de'),
        fr: func('fr')
      }
      if (val.de && val.fr) {
        return val[this.lang]
      } else if (val.de) {
        return val.de
      } else if (val.fr) {
        return val.fr
      }
    }
  }
}
</script>

<style>
.zw-document {
  min-width: 120px;
  max-width: 420px;
  padding: 8px;
  background-color: rgb(230, 230, 230);
}

.zw-document > pre {
  line-height: 1.4em;
  white-space: pre-wrap;
}

.zw-document > img {
  max-width: 100%;
}

.zw-document > .pdf {
  width: 100%;
  height: 100vh;
}
</style>
