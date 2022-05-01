<template>
  <div class="zw-user-memberships">
    <div class="heading"><zw-string>label.edit_affiliations</zw-string></div>
    <div class="scroll-container">
      <table>
        <tr>
          <td><zw-string>label.workspace</zw-string></td>
          <td><zw-string>label.member</zw-string></td>
          <td><zw-string>label.editor</zw-string></td>
        </tr>
        <tr v-for="(workspace, i) in workspaces">
          <td>{{workspace.value}}</td>
          <td><el-checkbox v-model="model1[i]"></el-checkbox></td>
          <td><el-checkbox v-model="model2[i]"></el-checkbox></td>
        </tr>
      </table>
    </div>
    <div>
      <el-button class="submit-button" type="primary" size="medium" @click="updateMemberships">
        <zw-string>action.submit</zw-string>
      </el-button>
      <el-button size="medium" @click="clearSecondaryPanel">
        <zw-string>action.cancel</zw-string>
      </el-button>
    </div>
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
      model1: [],      // column1 checkbox model: a flag for every workspace, true=member
      model2: []       // column2 checkbox model: a flag for every workspace, true=editor
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
        this.model1 = this.workspaces.map(workspace => this.isMember(workspace))
        this.model2 = this.workspaces.map(workspace => this.isEditor(workspace))
      })
    },

    isMember (workspace) {
      return this.findUser(workspace) !== undefined
    },

    isEditor (workspace) {
      return this.findUser(workspace)?.assoc.children['zukunftswerk.editor']?.value
    },

    findUser (workspace) {
      return this.memberships?.find(ws => ws.id === workspace.id)
    },

    updateMemberships () {
      let i = 0; const addWorkspaceIds1    = this.workspaces.filter(ws =>  this.model1[i++]).map(ws => ws.id)
          i = 0; const removeWorkspaceIds1 = this.workspaces.filter(ws => !this.model1[i++]).map(ws => ws.id)
          i = 0; const addWorkspaceIds2    = this.workspaces.filter(ws =>  this.model2[i++]).map(ws => ws.id)
          i = 0; const removeWorkspaceIds2 = this.workspaces.filter(ws => !this.model2[i++]).map(ws => ws.id)
      this.$emit('loading')
      this.$store.dispatch('admin/updateUserMemberships', {
        addWorkspaceIds1, removeWorkspaceIds1, addWorkspaceIds2, removeWorkspaceIds2
      }).then(() => {
        this.$emit('complete')
        this.clearSecondaryPanel()
      })
    }
  }
}
</script>

<style>
.zw-user-memberships {
  display: flex;
  flex-direction: column;
  padding-right: 0 !important;
}

.zw-user-memberships .scroll-container {
  overflow: auto;
  flex-grow: 1;
}

.zw-user-memberships table {
  width: 100%;
}
</style>
