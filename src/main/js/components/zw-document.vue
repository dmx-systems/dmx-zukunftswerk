<template>
  <div :class="['zw-document', {'filter': isFiltered}, mode]" v-loading="isLoading">
    <template v-if="infoMode">
      <div class="discussion-button">
        <el-button type="text" icon="el-icon-chat-round" @click="setFilter" :title="discussTooltip"></el-button>
      </div>
      <div class="doc-name" v-html="docName"></div>
      <pre v-if="isText">{{text}}</pre>
      <img v-if="isImage" :src="fileUrl" @loadstart="loading" @load="complete">
      <audio v-if="isAudio" :src="fileUrl" controls></audio>
      <video v-if="isVideo" :src="fileUrl" controls @loadeddata="update"></video>
      <zw-pdf-viewer v-if="isPDF" :topic="topic" :src="fileUrl" @loading="loading" @complete="complete"></zw-pdf-viewer>
    </template>
    <template v-else>
      <div class="field">
        <div class="field-label"><zw-string>label.document_name</zw-string> <span v-if="!isNew">({{lang1}})</span></div>
        <el-input v-model="docModel.names[lang1].value" ref="docName"></el-input>
      </div>
      <template  v-if="!isNew">
        <div class="translate">
          <el-button type="text" icon="el-icon-bottom" :title="translateTooltip" @click="translate"></el-button>
        </div>
        <div class="field">
          <div class="field-label"><zw-string>label.document_name</zw-string> <span>({{lang2}})</span></div>
          <el-input v-model="docModel.names[lang2].value"></el-input>
          <div :class="['edited-indicator', {edited: editedFlag}]"><zw-string>label.translation_edited</zw-string></div>
        </div>
      </template>
      <div class="field">
        <div class="field-label"><zw-string>label.file</zw-string> <span v-if="!isNew">({{lang1}})</span></div>
        <el-upload drag :action="uploadUrl" :on-success="onSuccess[lang1]" :on-error="onError[lang1]"
            :ref="'upload.' + lang1" :before-upload="beforeUpload">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        </el-upload>
        <div class="error">{{error[lang1]}}</div>
        <el-input v-model="docModel.paths[lang1].value"></el-input>
      </div>
      <div class="field" v-if="!isNew">
        <div class="field-label"><zw-string>label.file</zw-string> <span>({{lang2}})</span></div>
        <el-upload drag :action="uploadUrl" :on-success="onSuccess[lang2]" :on-error="onError[lang2]"
            :ref="'upload.' + lang2" :before-upload="beforeUpload">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        </el-upload>
        <div class="error">{{error[lang2]}}</div>
        <el-input v-model="docModel.paths[lang2].value"></el-input>
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
import Vue from 'vue'
import dmx from 'dmx-api'
import zw from '../zw-globals'

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/doc-util').default,
    require('./mixins/translation').default,
    require('./mixins/highlight').default,
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

  updated () {
    this.$store.dispatch('updateControlBox')
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
      type: 'zukunftswerk.document_name',
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

    docNames () {
      return {
        de: this.topic.children['zukunftswerk.document_name.de'],
        fr: this.topic.children['zukunftswerk.document_name.fr']
      }
    },

    docLang () {
      const de = this.docNames.de?.value
      const fr = this.docNames.fr?.value
      if (de && fr) {
        return this.lang
      } else if (de) {
        return 'de'
      } else if (fr) {
        return 'fr'
      }
    },

    docName () {
      // Note: docLang is undefined if neiter "de" nor "fr" is filled
      return this.highlight(this.topic, this.docNames[this.docLang]?.value)
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
      return this.file?.children['dmx.files.media_type']?.value
    },

    uploadUrl () {
      return '/upload/' + encodeURIComponent('/')
    },

    isText () {
      return this.mediaType?.startsWith('text/')
    },

    isImage () {
      return this.mediaType?.startsWith('image/')
    },

    isAudio () {
      return this.mediaType?.startsWith('audio/')
    },

    isVideo () {
      return this.mediaType?.startsWith('video/')
    },

    isPDF () {
      return this.mediaType === 'application/pdf'
    },

    // TODO: factor out as a mixin? Copies in zw-note.vue, zw-label.vue, zw-textblock.vue
    isNew () {
      return this.topic.id < 0
    },

    isFiltered () {
      return this.documentFilter?.id === this.topic.id
    },

    documentFilter () {
      return this.$store.state.documentFilter
    },

    discussTooltip () {
      return zw.getString('tooltip.discuss')
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

    setFilter () {
      this.$store.dispatch('setDocumentFilter', this.topic)
    },

    save () {
      this.loading()
      let action, arg, msgBox
      if (this.isNew) {
        action = 'createDocument'
        arg = {topic: this.topic}
        msgBox = 'confirm'
      } else {
        action = 'update'
        arg = this.topic
        // transfer edit buffer to topic model
        this.topic.children['zukunftswerk.translation_edited'] = {value: this.editedFlag}
        Vue.set(this.topic.children, 'zukunftswerk.document_name.de', this.docModel.names.de)
        Vue.set(this.topic.children, 'zukunftswerk.document_name.fr', this.docModel.names.fr)
        this.topic.children['dmx.files.file#zukunftswerk.de'] = this.docModel.paths.de.value ? this.docModel.files.de :
          undefined
        this.topic.children['dmx.files.file#zukunftswerk.fr'] = this.docModel.paths.fr.value ? this.docModel.files.fr :
          undefined
      }
      this.$store.dispatch(action, arg).catch(error => {
        return this.handleError(error, msgBox)
      }).then(result => {
        if (result === 'confirm') {
          arg.monolingual = true
          this.$store.dispatch(action, arg).catch(error => {
            errorHandler(error)     // generic error handler ### FIXME?
          })
        }
      }).catch(result => {
        // console.log('cancel', result)
      }).finally(() => {
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
  background-color: var(--background-color);
}

.zw-document.filter {
  background-color: var(--primary-color);
}

.zw-document.filter .discussion-button {
  background-color: var(--primary-color);
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
  background-color: var(--background-color);
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

.zw-document .translate {
  text-align: center;
  margin-top: 12px;
}

.zw-document .translate .el-button {
  font-size: 24px;
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
