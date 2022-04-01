<template>
  <div class="zw-user-list">
    <div class="heading"><zw-string>label.admin_users</zw-string></div>
    <div class="scroll-container">
      <el-collapse v-model="expandedUsernames">
        <zw-user-item v-for="user in users" :user="user" :key="user.id"></zw-user-item>
      </el-collapse>
    </div>
    <el-button class="add-button" size="medium" icon="el-icon-plus" @click="addUser">
      <zw-string>action.add_user</zw-string>
    </el-button>
  </div>
</template>

<script>
export default {

  created () {
    this.$store.dispatch('fetchAllUsers')
  },

  computed: {

    users () {
      return this.$store.state.users
    },

    expandedUsernames: {
      get () {
        return this.$store.state.admin.expandedUsernames
      },
      set (usernames) {
        this.$store.dispatch('admin/setExpandedUsernames', usernames)
      }
    }
  },

  methods: {
    addUser () {
      this.$store.dispatch('admin/setSecondaryPanel', 'zw-user-form')
    }
  },

  components: {
    'zw-user-item': require('./zw-user-item').default
  }
}
</script>
