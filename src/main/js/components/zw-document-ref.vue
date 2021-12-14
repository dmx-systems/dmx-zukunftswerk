<template>
  <div class="zw-document-ref" v-if="document">
    <el-button class="button" type="text" @click="revealDoc">
      <span class="fa fa-file-o"></span>
      <span>{{docName}}</span>
    </el-button>
    <el-button class="remove-button" v-if="removable" type="text" icon="el-icon-circle-close" @click="remove">
    </el-button>
  </div>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  props: {
    document: Object,     // the referred-to Document, optional (plain Object, not a dmx.Topic)
    removable: Boolean    // if true the remove-button is rendered, optional
  },

  computed: {

    docLang () {
      const docNames = this.docNames
      if (docNames.de && docNames.fr) {
        return this.lang
      } else if (docNames.de) {
        return 'de'
      } else if (docNames.fr) {
        return 'fr'
      }
    },

    docName () {
      if (this.docLang) {
        const name = this.docNames[this.docLang]
        return name && name.value
      }
    },

    docNames () {
      return {
        de: this.document.children['zukunftswerk.document_name.de'],
        fr: this.document.children['zukunftswerk.document_name.fr']
      }
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    revealDoc () {
      this.$store.dispatch('revealDocument', this.document)
    },

    remove () {
      this.$emit('remove', this.document)
    }
  }
}
</script>

<style>
.zw-document-ref {
  position: relative;
}

.zw-document-ref .button {
  white-space: unset;     /* Element UI button default is "nowrap" */
  text-align: unset;      /* Element UI button default is "center" */
}

.zw-document-ref .remove-button {
  position: absolute;
  top: -3px;
  font-size: 20px;
  visibility: hidden;
}
.zw-document-ref:hover .remove-button {
  visibility: visible;
}
</style>
