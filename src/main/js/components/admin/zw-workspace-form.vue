<template>
  <div class="zw-workspace-form">
    <div class="heading"><zw-string>label.new_workspace</zw-string></div>
    <div class="field">
      <div class="field-label"><zw-string>label.workspace_name</zw-string> (de)</div>
      <el-input v-model="model.de"></el-input>
    </div>
    <div class="field">
      <div class="field-label"><zw-string>label.workspace_name</zw-string> (fr)</div>
      <el-input v-model="model.fr"></el-input>
    </div>
    <el-button class="submit-button" type="primary" size="medium" @click="createWorkspace">
      <zw-string>action.submit</zw-string>
    </el-button>
    <el-button size="medium" @click="clearSecondaryPanel">
      <zw-string>action.cancel</zw-string>
    </el-button>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/admin-util').default
  ],

  created () {
    console.log('zw-workspace-form')
    this.model = {
      de: this.editBuffer.children['dmx.workspaces.workspace_name#zukunftswerk.de'].value,
      fr: this.editBuffer.children['dmx.workspaces.workspace_name#zukunftswerk.fr'].value
    }
  },

  data () {
    return {
      model: undefined
    }
  },

  computed: {

    formMode () {
      return this.$store.state.admin.formMode
    },

    editBuffer () {
      return this.$store.state.admin.editBuffer
    }
  },

  methods: {
    createWorkspace () {
      this.$emit('loading')
      this.$store.dispatch('admin/createZWWorkspace', {
        nameDe: this.model.de,
        nameFr: this.model.fr
      }).then(() => {
        this.$emit('complete')
        this.clearSecondaryPanel()
      })
    }
  }
}
</script>
