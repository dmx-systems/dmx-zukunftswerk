<template>
  <div class="zw-user-form">
    <div class="heading"><zw-string>label.new_user</zw-string></div>
    <div class="field">
      <div class="field-label"><zw-string>label.display_name</zw-string></div>
      <el-input v-model="model.displayName"></el-input>
    </div>
    <div class="field">
      <div class="field-label"><zw-string>label.email_address</zw-string></div>
      <el-input v-model="model.emailAddress"></el-input>
    </div>
    <el-button class="submit-button" type="primary" size="medium" @click="createUser">
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
    this.$store.dispatch('admin/fetchZWWorkspaces')
  },

  data () {
    return {
      model: {
        displayName: '',
        emailAddress: ''
      }
    }
  },

  methods: {
    createUser () {
      this.$store.dispatch('admin/createUser', this.model).then(this.clearSecondaryPanel)
    }
  }
}
</script>
