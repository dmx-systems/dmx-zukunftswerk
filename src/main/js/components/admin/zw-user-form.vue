<template>
  <div class="zw-user-form">
    <div class="heading"><zw-string>{{heading}}</zw-string></div>
    <div class="field">
      <div class="field-label"><zw-string>label.display_name</zw-string></div>
      <el-input v-model="model.displayName"></el-input>
    </div>
    <div class="field">
      <div class="field-label"><zw-string>label.email_address</zw-string></div>
      <el-input v-model="model.emailAddress" :disabled="isUpdate"></el-input>
    </div>
    <el-button class="submit-button" type="primary" size="medium" :disabled="isIncomplete" @click="submit">
      <zw-string>action.submit</zw-string>
    </el-button>
    <el-button size="medium" @click="clearSecondaryPanel">
      <zw-string>action.cancel</zw-string>
    </el-button>
  </div>
</template>

<script>
import zw from '../../zw-globals'

export default {

  mixins: [
    require('./mixins/admin-util').default
  ],

  created () {
    if (this.isUpdate) {
      const username = this.activeUser.value
      this.model.emailAddress = username
      this.model.displayName = zw.getDisplayName(username)
    }
  },

  data () {
    return {
      model: {
        displayName: '',
        emailAddress: ''
      }
    }
  },

  computed: {

    heading () {
      return this.isUpdate ? 'label.edit_user' : 'label.new_user'
    },

    isUpdate () {
      return this.formMode === 'update'
    },

    isIncomplete () {
      return !this.model.displayName || !this.model.emailAddress
    },

    formMode () {
      return this.$store.state.admin.formMode
    },

    activeUser () {
      return this.$store.state.admin.activeUser
    }
  },

  methods: {
    submit () {
      this.$emit('loading')
      let action = this.isUpdate ? 'admin/updateUser' : 'admin/createUser'
      this.$store.dispatch(action, this.model).then(() => {
        this.$emit('complete')    // must emit *before* removing this panel
        this.clearSecondaryPanel()
      }).catch(error => {
        this.$alert(error.message, {
          type: 'error',
          showClose: false
        }).then(() => {
          this.$emit('complete')
        })
      })
    }
  }
}
</script>
