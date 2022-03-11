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

  created () {
    this.$store.dispatch('admin/fetchZWWorkspaces')
  },

  data () {
    return {
      model: {
        de: '',
        fr: ''
      }
    }
  },

  methods: {

    createWorkspace () {
      this.$store.dispatch('admin/createZWWorkspace', {
        nameDe: this.model.de,
        nameFr: this.model.fr
      }).then(this.clearSecondaryPanel)
    },

    clearSecondaryPanel () {
      this.$store.dispatch('admin/setSecondaryPanel', undefined)
    }
  }
}
</script>

<style>
.zw-workspace-form {
  flex-grow: 1;
  padding: 30px;
  background-color: var(--discussion-color);
}

.zw-workspace-form .heading {
  font-size: 20px;
  margin-bottom: 22px;
}

.zw-workspace-form .submit-button {
  margin-top: 26px;
}
</style>
