<template>
  <div class="zw-user-list">
    <div class="heading"><zw-string>label.admin_users</zw-string></div>
    <el-collapse v-model="expanded" @change="change">
      <zw-user-item v-for="user in users" :user="user" :key="user.id"></zw-user-item>
    </el-collapse>
    <el-button class="add-button" size="medium" icon="el-icon-plus" @click="addUser">
      <zw-string>action.add_user</zw-string>
    </el-button>
  </div>
</template>

<script>
export default {

  created () {
    this.$store.dispatch('admin/fetchUsers')
  },

  data () {
    return {
      expanded: []
    }
  },

  computed: {
    users () {
      return this.$store.state.admin.users
    }
  },

  methods: {

    change (expandedIds) {
      // TODO
      // console.log(expandedIds)
      // expandedIds.forEach(id => {
      //   this.$store.dispatch('admin/fetchMemberships', id)
      // })
    },

    addUser () {
      this.$store.dispatch('admin/setSecondaryPanel', 'zw-user-form')
    }
  },

  components: {
    'zw-user-item': require('./zw-user-item').default
  }
}
</script>
