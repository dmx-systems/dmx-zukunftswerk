<template>
  <div class="zw-membership-form">
    <div class="heading"><zw-string>label.edit_memberships</zw-string></div>
    <table>
      <tr>
        <td><zw-string>label.user</zw-string></td>
        <td><zw-string>label.member</zw-string></td>
        <td><zw-string>label.editor</zw-string></td>
      </tr>
      <tr v-for="(user, i) in users">
        <td>{{user.value}}</td>
        <td><el-checkbox v-model="model[i]"></el-checkbox></td>
      </tr>
    </table>
    <el-button class="submit-button" type="primary" size="medium" @click="updateMemberships">
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
    // console.log('zw-membership-form')
    this.initModel()
  },

  data () {
    return {
      model: []       // membership model: a flag for every user, true=member
    }
  },

  computed: {

    users () {
      return this.$store.state.admin.users
    },

    activeWorkspace () {
      return this.$store.state.admin.activeWorkspace
    },

    memberships () {
      return this.activeWorkspace.memberships
    }
  },

  watch: {
    activeWorkspace () {
      // console.log('watch activeWorkspace', this.activeWorkspace.id, this.memberships)
      this.initModel()
    }
  },

  methods: {

    initModel () {
      // console.log('initModel')
      Promise.all([
        this.$store.dispatch('admin/fetchAllUsers'),
        this.$store.dispatch('admin/fetchMemberships', this.activeWorkspace.id)
      ]).then(() => {
        this.model = this.users.map(user => this.isMember(user))
      })
    },

    isMember (user) {
      return this.memberships?.find(_user => _user.id === user.id) !== undefined
    },

    updateMemberships () {
      let i = 0; const addUserIds    = this.users.filter(user =>  this.model[i++]).map(user => user.id)
          i = 0; const removeUserIds = this.users.filter(user => !this.model[i++]).map(user => user.id)
      this.$emit('loading')
      this.$store.dispatch('admin/updateMemberships', {addUserIds, removeUserIds}).then(() => {
        this.$emit('complete')
        this.clearSecondaryPanel()
      })
    }
  }
}
</script>

<style>
.zw-membership-form table {
  width: 100%;
}
</style>
