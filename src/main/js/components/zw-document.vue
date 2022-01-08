<template>
  <div class="zw-document" v-loading="saving">
    <template v-if="infoMode">
      <div class="discussion-button">
        <el-button type="text" icon="el-icon-chat-round" @click="newComment"></el-button>
      </div>
      {{docName}}
      <pre v-if="isText">{{text}}</pre>
      <img v-if="isImage" :src="fileUrl" @load="update">
      <audio v-if="isAudio" :src="fileUrl" controls></audio>
      <video v-if="isVideo" :src="fileUrl" controls @loadeddata="update"></video>
      <embed v-if="isPDF" :src="fileUrl" :type="mediaType" class="pdf" @load="update"></embed>
    </template>
    <template v-else>
      <div class="field">
        <div class="field-label">Dokument Name (de)</div>
        <el-input v-model="docNameTopics.de.value" ref="docName"></el-input>
      </div>
      <div class="field">
        <div class="field-label">Nom du document (fr)</div>
        <el-input v-model="docNameTopics.fr.value"></el-input>
      </div>
      <el-button class="save-button" type="primary" size="medium" @click="save">
        <zw-string>button.submit</zw-string>
      </el-button>
    </template>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  created () {
    // console.log('zw-document', this.path)
    this.initText()
  },

  mounted () {
    if (this.formMode) {
      this.$refs.docName.focus()
    }
  },

  props: {
    topic: {                  // the Document topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    },
    mode: {                   // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  data () {
    return {
      text: '',
      saving: false           // true while document is saved
    }
  },

  computed: {

    lang () {
      return this.$store.state.lang
    },

    docLang () {
      const files = this.files
      if (files.de && files.fr) {
        return this.lang
      } else if (files.de) {
        return 'de'
      } else if (files.fr) {
        return 'fr'
      } else {
        return this.lang
      }
    },

    docName () {
      const name = this.getDocNameTopic(this.docLang)
      return name && name.value
    },

    docNameTopics () {
      return {
        de: this.getDocNameTopic('de'),
        fr: this.getDocNameTopic('fr')
      }
    },

    files () {
      return {
        de: this.getFile('de'),
        fr: this.getFile('fr')
      }
    },

    file () {
      return this.files[this.docLang]
    },

    path () {
      return this.file && this.file.children['dmx.files.path'].value
    },

    mediaType () {
      if (this.file) {
        const mediaType = this.file.children['dmx.files.media_type']
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
    },

    infoMode () {
      return this.mode === 'info'
    },

    formMode () {
      return this.mode === 'form'
    }
  },

  watch: {
    file () {
      this.initText()
    }
  },

  methods: {

    initText () {
      if (this.isText) {
        this.$store.dispatch('getFileContent', this.path).then(content => {
          this.text = content
        })
      }
    },

    getDocNameTopic (lang) {
      return this.topic.children['zukunftswerk.document_name.' + lang]
    },

    getFile (lang) {
      return this.topic.children['dmx.files.file#zukunftswerk.' + lang]
    },

    newComment () {
      this.$store.dispatch('setRefDocument', this.topic)
    },

    save () {
      this.saving = true
      this.$store.dispatch('createDocument', this.topic).then(() => {
        this.saving = false
      })
    }
  }
}
</script>

<style>
.zw-document {
  min-width: 120px;
  max-width: 420px;
  padding: 12px;
  background-color: rgb(230, 230, 230);
}

.zw-document .discussion-button {
  position: absolute;
  top: 0;
  right: -28px;
  padding: 4px;
  background-color: rgb(193, 216, 235);
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
}

.zw-document .discussion-button .el-button {
  font-size: 18px;
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

.zw-document .save-button {
  margin-top: var(--field-spacing);
}
</style>
