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
    },

    clearSecondaryPanel () {
      this.$store.dispatch('admin/setSecondaryPanel', undefined)
    }
  }
}
</script>

<style>
.zw-user-form {
  flex-grow: 1;
  padding: 30px;
  background-color: var(--discussion-color);
}

.zw-user-form .heading {
  font-size: 20px;
  margin-bottom: 22px;
}

.zw-user-form .submit-button {
  margin-top: 26px;
}
</style>
