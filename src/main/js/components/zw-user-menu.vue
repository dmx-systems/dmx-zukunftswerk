<template>
  <div class="zw-user-menu">
    <el-dropdown size="medium" trigger="click" @command="handle">
      <el-button type="text" class="fa fa-user-circle">
        <span class="el-icon-arrow-down el-icon--right"></span>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="userProfile">
          <b>{{username}}</b>
        </el-dropdown-item>
        <el-dropdown-item command="logout" divided>
          Logout
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog :visible.sync="visible" width="350px">
      <zw-string slot="title">label.user_profile</zw-string>
      <div class="field">
        <div class="field-label"><zw-string>label.display_name</zw-string></div>
        <el-input v-model="displayName"></el-input>
      </div>
      <el-button class="save-button" type="primary" @click="save">
        <zw-string>action.submit</zw-string>
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
import zw from '../zw-globals'

export default {

  data () {
    return {
      // User Profile dialog
      visible: false,
      displayName: ''
    }
  },

  computed: {
    username () {
      return this.$store.state.username
    }
  },

  methods: {

    handle (command) {
      switch (command) {
      case 'userProfile':
        this.visible = true
        this.displayName = zw.getDisplayName(this.username)
        break
      case 'logout':
        this.$store.dispatch('logout').then(() =>
          this.$store.dispatch('callRootRoute')
        )
        break
      }
    },

    save () {
      // TODO
    }
  }
}
</script>

<style>
.zw-user-menu .save-button {
  margin-top: 26px;
}
</style>
