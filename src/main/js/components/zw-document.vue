<template>
  <div class="zw-document" v-loading="saving">
    <template v-if="infoMode">
      <div class="discussion-button">
        <el-button type="text" icon="el-icon-chat-round" @click="newComment"></el-button>
      </div>
      <div>{{docName}}</div>
      <pre v-if="isText">{{text}}</pre>
      <img v-if="isImage" :src="fileUrl" @load="update">
      <audio v-if="isAudio" :src="fileUrl" controls></audio>
      <video v-if="isVideo" :src="fileUrl" controls @loadeddata="update"></video>
      <embed v-if="isPDF" :src="fileUrl" :type="mediaType" class="pdf" @load="update"></embed>
    </template>
    <template v-else>
      <div class="field">
        <div class="field-label"><zw-string>label.document_name</zw-string> (de)</div>
        <el-input v-model="docNameTopics.de.value" ref="docName"></el-input>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.document_name</zw-string> (fr)</div>
        <el-input v-model="docNameTopics.fr.value"></el-input>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.file</zw-string> (de)</div>
        <el-upload drag :action="uploadUrl" :on-success="onSuccess.de" :on-error="onError.de" ref="upload.de">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        </el-upload>
        <div class="error">{{error.de}}</div>
        <el-input v-model="pathTopics.de.value"></el-input>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.file</zw-string> (fr)</div>
        <el-upload drag :action="uploadUrl" :on-success="onSuccess.fr" :on-error="onError.fr" ref="upload.fr">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        </el-upload>
        <div class="error">{{error.fr}}</div>
        <el-input v-model="pathTopics.fr.value"></el-input>
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
      text: '',               // used only for text files: the contained text (String)      FIXME: 2x ?
      saving: false,          // true while document is saved
      onSuccess: {            // upload success handler (2x Function)
        de: this.createSuccessHandler('de'),
        fr: this.createSuccessHandler('fr')
      },
      onError: {              // upload error handler (2x Function)
        de: this.createErrorHandler('de'),
        fr: this.createErrorHandler('fr')
      },
      error: {                // the error happened while upload, if any (String)
        de: '',
        fr: ''
      }
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

    pathTopics () {
      return {
        de: this.getPathTopic(this.files.de),
        fr: this.getPathTopic(this.files.fr)
      }
    },

    path () {
      return this.getPath(this.file)
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

    getDocNameTopic (lang) {
      return this.topic.children['zukunftswerk.document_name.' + lang]
    },

    getFile (lang) {
      return this.topic.children['dmx.files.file#zukunftswerk.' + lang]
    },

    getPath (file) {
      const path = this.getPathTopic(file)
      return path && path.value
    },

    getPathTopic (file) {
      return file && file.children['dmx.files.path']
    },

    newComment () {
      this.$store.dispatch('setRefDocument', this.topic)
    },

    save () {
      this.saving = true
      this.$store.dispatch('createDocument', this.topic).then(() => {
        this.saving = false
      })
    },

    createSuccessHandler (lang) {
      return (response, file, fileList) => {
        const fileTopic = response.topic
        this.pathTopics[lang].value = this.getPath(fileTopic)
        this.$refs['upload.' + lang].clearFiles()
      }
    },

    createErrorHandler (lang) {
      return (error, file, fileList) => {
        this.error[lang] = `${error.name}: ${error.message}`
      }
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

.zw-document .el-upload-dragger {
  height: 90px;             /* Element UI default is 180px */
}

.zw-document .el-upload-dragger .el-icon-upload {
  font-size: 50px;          /* Element UI default is 67px */
  margin: 12px 0 0 0;       /* Element UI default is 40px 0 16px */
}

.zw-document .error {
  color: var(--color-danger);
}
</style>
