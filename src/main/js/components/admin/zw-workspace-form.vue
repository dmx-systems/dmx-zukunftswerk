<template>
  <div class="zw-workspace-form">
    <div class="heading"><zw-string>{{heading}}</zw-string></div>
    <div class="field">
      <div class="field-label"><zw-string>label.workspace_name</zw-string> (de)</div>
      <el-input v-model="de.value"></el-input>
    </div>
    <div class="field">
      <div class="field-label"><zw-string>label.workspace_name</zw-string> (fr)</div>
      <el-input v-model="fr.value"></el-input>
    </div>
    <el-button class="submit-button" type="primary" size="medium" @click="submit">
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

  computed: {

    de () {
      return this.editBuffer.children['dmx.workspaces.workspace_name#zukunftswerk.de']
    },

    fr () {
      return this.editBuffer.children['dmx.workspaces.workspace_name#zukunftswerk.fr']
    },

    heading () {
      return this.isUpdate ? 'label.edit_workspace' : 'label.new_workspace'
    },

    isUpdate () {
      return this.formMode === 'update'
    },

    formMode () {
      return this.$store.state.admin.formMode
    },

    editBuffer () {
      return this.$store.state.admin.editBuffer
    }
  },

  methods: {
    submit () {
      let p
      this.$emit('loading')
      if (this.formMode === 'create') {
        p = this.$store.dispatch('admin/createZWWorkspace', {
          nameDe: this.de.value,
          nameFr: this.fr.value
        })
      } else if (this.formMode === 'update') {
        p = this.$store.dispatch('admin/updateWorkspace', this.editBuffer)
      }
      p.then(() => {
        this.$emit('complete')
        this.clearSecondaryPanel()
      })
    }
  }
}
</script>
