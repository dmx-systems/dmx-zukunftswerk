<template>
  <el-dropdown class="zw-user-menu" size="medium" trigger="click" @command="handle">
    <el-button type="text" class="fa fa-user-circle">
      <span class="el-icon-arrow-down el-icon--right"></span>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="revealUsername" title="Reveal Username topic">
        <b>{{username}}</b>
      </el-dropdown-item>
      <el-dropdown-item command="logout" divided>
        Logout
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {

  computed: {
    username () {
      return this.$store.state.username
    }
  },

  methods: {
    handle (command) {
      this.$store.dispatch(command)
    }
  }
}
</script>
