<template>
  <div :class="['zw-document', {'ref-doc': isRefDocument}, mode]" v-loading="isLoading">
    <template v-if="infoMode">
      <div class="discussion-button">
        <el-button type="text" icon="el-icon-chat-round" @click="setRefDocument"></el-button>
      </div>
      <div class="doc-name">{{docName}}</div>
      <pre v-if="isText">{{text}}</pre>
      <img v-if="isImage" :src="fileUrl" @loadstart="loading" @load="complete">
      <audio v-if="isAudio" :src="fileUrl" controls></audio>
      <video v-if="isVideo" :src="fileUrl" controls @loadeddata="update"></video>
      <zw-pdf-viewer v-if="isPDF" :src="fileUrl" @loading="loading" @complete="complete"></zw-pdf-viewer>
    </template>
    <template v-else>
      <div class="field">
        <div class="field-label"><zw-string>label.document_name</zw-string> (de)</div>
        <el-input v-model="docModel.names.de.value" ref="docName"></el-input>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.document_name</zw-string> (fr)</div>
        <el-input v-model="docModel.names.fr.value"></el-input>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.file</zw-string> (de)</div>
        <el-upload drag :action="uploadUrl" :on-success="onSuccess.de" :on-error="onError.de" ref="upload.de"
            :before-upload="beforeUpload">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        </el-upload>
        <div class="error">{{error.de}}</div>
        <el-input v-model="docModel.paths.de.value"></el-input>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.file</zw-string> (fr)</div>
        <el-upload drag :action="uploadUrl" :on-success="onSuccess.fr" :on-error="onError.fr" ref="upload.fr"
            :before-upload="beforeUpload">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        </el-upload>
        <div class="error">{{error.fr}}</div>
        <el-input v-model="docModel.paths.fr.value"></el-input>
      </div>
      <el-button class="save-button" type="primary" size="medium" :disabled="saveButtonDisabled" @click="save">
        <zw-string>action.submit</zw-string>
      </el-button>
      <el-button size="medium" @click="cancel">
        <zw-string>action.cancel</zw-string>
      </el-button>
    </template>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/doc-util').default,
    require('./mixins/cancel').default
  ],

  created () {
    // console.log('zw-document', this.topic, this.topicBuffer, this.isNew)
    this.$emit('action', {
      action: 'action.download',
      handler: this.download,
      enabledForReadOnly: true
    })
    this.initText()
  },

  mounted () {
    if (this.formMode) {
      this.$refs.docName.focus()    // FIXME
    }
  },

  props: {

    topic: {                        // the Document topic to render (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    },

    topicBuffer: dmx.ViewTopic,     // the edit buffer (dmx.ViewTopic)    // TODO: unify "topic" and "topicBuffer"?

    mode: {                         // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  data () {
    return {
      text: '',                     // used only for text files: the contained text (String)      FIXME: 2x ?
      isLoading: false,             // true while document is loaded/saved (Boolean)
      saveButtonDisabled: false,    // true when save button is disabled (Boolean)
      onSuccess: {                  // upload success handler (2x Function)
        de: this.createSuccessHandler('de'),
        fr: this.createSuccessHandler('fr')
      },
      onError: {                    // upload error handler (2x Function)
        de: this.createErrorHandler('de'),
        fr: this.createErrorHandler('fr')
      },
      error: {                      // the error happened while upload, if any (String)
        de: '',
        fr: ''
      }
    }
  },

  computed: {

    docName () {
      const de = this.docNames.de && this.docNames.de.value
      const fr = this.docNames.fr && this.docNames.fr.value
      if (de && fr) {
        return this.docNames[this.lang].value
      } else if (de) {
        return this.docNames.de.value
      } else if (fr) {
        return this.docNames.fr.value
      }
    },

    docNames () {
      return {
        de: this.getDocName('de'),
        fr: this.getDocName('fr')
      }
    },

    docModel () {
      if (this.isNew) {
        return {
          names: this.docNames,
          files: this.files,
          paths: this.pathTopics
        }
      } else {
        return {
          names: {
            de: this.topicBuffer.children['zukunftswerk.document_name.de'],
            fr: this.topicBuffer.children['zukunftswerk.document_name.fr']
          },
          files: {
            de: this.topicBuffer.children['dmx.files.file#zukunftswerk.de'],
            fr: this.topicBuffer.children['dmx.files.file#zukunftswerk.fr']
          },
          paths: {
            de: this.getPathTopic(this.topicBuffer.children['dmx.files.file#zukunftswerk.de']),
            fr: this.getPathTopic(this.topicBuffer.children['dmx.files.file#zukunftswerk.fr'])
          }
        }
      }
    },

    pathTopics () {
      return {
        de: this.getPathTopic(this.files.de),
        fr: this.getPathTopic(this.files.fr)
      }
    },

    mediaType () {
      if (this.file) {
        const mediaType = this.file.children['dmx.files.media_type']
        return mediaType && mediaType.value
      }
    },

    uploadUrl () {
      return '/upload/' + encodeURIComponent('/')
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

    isNew () {
      return this.topic.id === -1
    },

    isRefDocument () {
      return this.refDocument && this.refDocument.id === this.topic.id
    },

    refDocument () {
      return this.$store.state.refDocument
    }
  },

  watch: {
    file () {
      this.initText()
    }
  },

  methods: {

    update() {
      // this.$emit('update')     // ### FIXME?
    },

    initText () {
      if (this.isText) {
        this.$store.dispatch('getFileContent', this.path).then(content => {
          this.text = content
        })
      }
    },

    getDocName (lang) {
      return this.topic.children['zukunftswerk.document_name.' + lang]
    },

    setRefDocument () {
      this.$store.dispatch('setRefDocument', this.topic)
    },

    save () {
      this.loading()
      const p = this.isNew ? this.$store.dispatch('createDocument', this.topic) :
                             this.$store.dispatch('updateDocument', {topic: this.topic, docModel: this.docModel})
      p.then(() => {
        this.complete()
      })
    },

    download () {
      this.$store.dispatch('downloadFile', this.path)
    },

    loading () {
      // console.log('loading')
      this.isLoading = true
    },

    complete () {
      // console.log('complete')
      this.isLoading = false
    },

    createSuccessHandler (lang) {
      return (response, file, fileList) => {
        const fileTopic = response.topic
        delete fileTopic.assoc    // the lead-to-parent-folder assoc must not be contained in create/update request
        const topic = this.isNew ? this.topic : this.topicBuffer
        topic.children['dmx.files.file#zukunftswerk.' + lang] = fileTopic
        //
        this.$refs['upload.' + lang].clearFiles()
        this.saveButtonDisabled = false
      }
    },

    createErrorHandler (lang) {
      return (error, file, fileList) => {
        this.error[lang] = `${error.name}: ${error.message}`
        this.saveButtonDisabled = false
      }
    },

    beforeUpload (file) {
      this.saveButtonDisabled = true
    }
  }
}
</script>

<style>
.zw-document {
  box-sizing: border-box;
  height: 100%;
  padding: 8px;
  background-color: var(--discussion-color);
}

.zw-document.ref-doc {
  background-color: var(--doc-filter-color);
}

.zw-document.info {
  display: flex;
  flex-direction: column;
}

.zw-document .doc-name {
  font-weight: bold;
  margin-bottom: 10px;
}

.zw-document .discussion-button {
  position: absolute;
  top: 0;
  right: -28px;
  padding: 4px;
  background-color: var(--discussion-color);
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
  width: 100%;
}

.zw-document .save-button {
  margin-top: var(--field-spacing);
}

.zw-document .el-upload-dragger {
  height: 90px;             /* Element UI default is 180px */
}

.zw-document .el-upload-dragger .el-icon-upload {
  font-size: 50px;          /* Element UI default is 67px */
  margin: 8px 0 0 0;        /* Element UI default is 40px 0 16px */
}

.zw-document .error {
  color: var(--color-danger);
}
</style>
