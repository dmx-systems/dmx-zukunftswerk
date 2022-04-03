<template>
  <div class="zw-user-memberships">
    <div class="heading"><zw-string>label.edit_affiliations</zw-string></div>
    <table>
      <tr>
        <td><zw-string>label.workspace</zw-string></td>
        <td><zw-string>label.member</zw-string></td>
        <td><zw-string>label.editor</zw-string></td>
      </tr>
      <tr v-for="(workspace, i) in workspaces">
        <td>{{workspace.value}}</td>
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
    this.initModel()
  },

  data () {
    return {
      model: []       // membership model: a flag for every workspace, true=member
    }
  },

  computed: {

    workspaces () {
      return this.$store.state.admin.workspaces
    },

    activeUser () {
      return this.$store.state.admin.activeUser
    },

    memberships () {
      return this.activeUser.memberships
    }
  },

  watch: {
    activeUser () {
      this.initModel()
    }
  },

  methods: {

    initModel () {
      Promise.all([
        this.$store.dispatch('admin/fetchAllZWWorkspaces'),
        this.$store.dispatch('admin/fetchZWWorkspacesOfUser', this.activeUser.value)
      ]).then(() => {
        this.model = this.workspaces.map(workspace => this.isMember(workspace))
      })
    },

    isMember (workspace) {
      return this.memberships?.find(_workspace => _workspace.id === workspace.id) !== undefined
    },

    updateMemberships () {
      let i = 0; const addWorkspaceIds    = this.workspaces.filter(ws =>  this.model[i++]).map(ws => ws.id)
          i = 0; const removeWorkspaceIds = this.workspaces.filter(ws => !this.model[i++]).map(ws => ws.id)
      this.$emit('loading')
      this.$store.dispatch('admin/updateUserMemberships', {addWorkspaceIds, removeWorkspaceIds}).then(() => {
        this.$emit('complete')
        this.clearSecondaryPanel()
      })
    }
  }
}
</script>

<style>
.zw-user-memberships table {
  width: 100%;
}
</style>
