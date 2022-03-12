<template>
  <div class="zw-users">
    <div class="heading"><zw-string>label.admin_users</zw-string></div>
    <div v-for="user in users">{{user.value}}</div>
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
    }
  },

  computed: {
    users () {
      return this.$store.state.admin.users
    }
  },

  methods: {
    addUser () {
      this.$store.dispatch('admin/setSecondaryPanel', 'zw-user-form')
    }
  }
}
</script>
