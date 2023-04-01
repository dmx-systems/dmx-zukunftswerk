<template>
  <div class="zw-user-memberships">
    <div class="heading"><zw-string>label.edit_affiliations</zw-string></div>
    <div class="scroll-container">
      <table>
        <tr>
          <th><zw-string>label.workspace</zw-string></th>
          <th><zw-string>label.member</zw-string></th>
          <th><zw-string>label.editor</zw-string></th>
        </tr>
        <tr v-for="ws in workspaces">
          <td>{{getWorkspaceName(ws)}}</td>
          <td><el-checkbox v-model="model1[ws.id]"></el-checkbox></td>
          <td><el-checkbox v-model="model2[ws.id]" :disabled="!model1[ws.id]"></el-checkbox></td>
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
    require('./mixins/admin-util').default,
    require('../mixins/workspace-name').default
  ],

  created () {
    this.initModel()
  },

  data () {
    return {
      model1: {},     // checkbox model (column 1): workspace ID -> flag (true=member)
      model2: {}      // checkbox model (column 2): workspace ID -> flag (true=editor)
    }
  },

  computed: {

    workspaces () {
      return this.$store.getters['admin/sortedWorkspaces']
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
        this.$store.dispatch('admin/fetchAllZWWorkspaces'),     // TODO (optimization): don't refetch on user selection
        this.$store.dispatch('admin/fetchZWWorkspacesOfUser', this.activeUser.value)
      ]).then(() => {
        this.model1 = this.workspaces.reduce((model, ws) => {model[ws.id] = this.isMember(ws); return model}, {})
        this.model2 = this.workspaces.reduce((model, ws) => {model[ws.id] = this.isEditor(ws); return model}, {})
      })
    },

    isMember (workspace) {
      return this.findWorkspace(workspace) !== undefined
    },

    isEditor (workspace) {
      return this.findWorkspace(workspace)?.assoc.children['zukunftswerk.editor']?.value
    },

    /**
     * Finds the given workspace among the selected user's workspaces.
     *
     * @return  The found workspace; its "assoc" property holds the respective Membership association.
     *          If the selected user is not a member of the given workspace undefined is returned.
     */
    findWorkspace (workspace) {
      return this.memberships?.find(ws => ws.id === workspace.id)
    },

    updateMemberships () {
      const addWorkspaceIds1    = this.workspaces.filter(ws =>  this.model1[ws.id]).map(ws => ws.id)
      const removeWorkspaceIds1 = this.workspaces.filter(ws => !this.model1[ws.id]).map(ws => ws.id)
      const addWorkspaceIds2    = this.workspaces.filter(ws =>  this.model2[ws.id]).map(ws => ws.id)
      const removeWorkspaceIds2 = this.workspaces.filter(ws => !this.model2[ws.id]).map(ws => ws.id)
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

.zw-user-memberships table > tr > th {
  text-align: unset;        /* browser style is "center" */
  padding-bottom: 5px;
  padding-right: 20px;
}

.zw-user-memberships table > tr > td {
  word-break: break-all;    /* break long workspace names */
  padding-right: 20px;
}
</style>
