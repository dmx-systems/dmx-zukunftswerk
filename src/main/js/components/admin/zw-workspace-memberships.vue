<template>
  <div class="zw-workspace-memberships">
    <div class="heading"><zw-string>label.edit_memberships</zw-string></div>
    <div class="scroll-container">
      <table>
        <tr>
          <th><zw-string>label.user</zw-string></th>
          <th><zw-string>label.member</zw-string></th>
          <th><zw-string>label.editor</zw-string></th>
        </tr>
        <tr v-for="(user, i) in users">
          <td>{{user.value}}</td>
          <td><el-checkbox v-model="model1[i]"></el-checkbox></td>
          <td><el-checkbox v-model="model2[i]" :disabled="!model1[i]"></el-checkbox></td>
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
      model1: [],      // column1 checkbox model: a flag for every user, true=member
      model2: []       // column2 checkbox model: a flag for every user, true=editor
    }
  },

  computed: {

    users () {
      return this.$store.state.users
    },

    selectedWorkspace () {
      return this.$store.state.admin.selectedWorkspace
    },

    memberships () {
      return this.selectedWorkspace.memberships
    }
  },

  watch: {
    selectedWorkspace () {
      this.initModel()
    }
  },

  methods: {

    initModel () {
      Promise.all([
        this.$store.dispatch('fetchAllUsers'),
        this.$store.dispatch('admin/fetchWorkspaceMemberships', this.selectedWorkspace.id)
      ]).then(() => {
        this.model1 = this.users.map(user => this.isMember(user))
        this.model2 = this.users.map(user => this.isEditor(user))
      })
    },

    isMember (user) {
      return this.findUser(user) !== undefined
    },

    isEditor (user) {
      return this.findUser(user)?.assoc.children['zukunftswerk.editor']?.value
    },

    findUser (user) {
      return this.memberships?.find(u => u.id === user.id)
    },

    updateMemberships () {
      let i = 0; const addUserIds1    = this.users.filter(user =>  this.model1[i++]).map(user => user.id)
          i = 0; const removeUserIds1 = this.users.filter(user => !this.model1[i++]).map(user => user.id)
          i = 0; const addUserIds2    = this.users.filter(user =>  this.model2[i++]).map(user => user.id)
          i = 0; const removeUserIds2 = this.users.filter(user => !this.model2[i++]).map(user => user.id)
      this.$emit('loading')
      this.$store.dispatch('admin/updateWorkspaceMemberships', {
        addUserIds1, removeUserIds1, addUserIds2, removeUserIds2
      }).then(() => {
        this.$emit('complete')
        this.clearSecondaryPanel()
      })
    }
  }
}
</script>

<style>
.zw-workspace-memberships {
  display: flex;
  flex-direction: column;
  padding-right: 0 !important;
}

.zw-workspace-memberships .scroll-container {
  overflow: auto;
  flex-grow: 1;
}

.zw-workspace-memberships table {
  width: 100%;
}

.zw-workspace-memberships table > tr > th {
  text-align: unset;        /* browser style is "center" */
  padding-bottom: 5px;
  padding-right: 20px;
}

.zw-workspace-memberships table > tr > td {
  word-break: break-all;    /* break long usernames */
  padding-right: 20px;
}
</style>
