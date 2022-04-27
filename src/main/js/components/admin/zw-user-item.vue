<template>
  <el-collapse-item :class="['zw-user-item', {'zw-selected': selected}]" :name="user.value">
    <div class="user" slot="title">
      <div class="name"><span class="fa fa-fw fa-user"></span> {{displayName}} ({{user.value}})</div>
      <el-dropdown size="medium" trigger="click" @command="handle" @click.native.stop>
        <el-button type="text" class="fa fa-fw fa-ellipsis-v"></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="edit">
            <i class="fa fa-fw fa-pencil"></i><zw-string>action.edit_user</zw-string>
          </el-dropdown-item>
          <el-dropdown-item command="delete" :disabled="true">
            <i class="fa fa-fw fa-trash"></i><zw-string>action.delete_user</zw-string>
          </el-dropdown-item>
          <el-dropdown-item command="editAffiliations" divided>
            <i class="fa fa-fw fa-list"></i><zw-string>action.edit_affiliations</zw-string>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div v-for="workspace in user.memberships">
      <span class="fa fa-fw fa-list"></span>
      {{workspace.value}}
    </div>
  </el-collapse-item>
</template>

<script>
import zw from '../../zw-globals'

export default {

  props: {
    user: {      // plain Username topic
      type: Object,
      required: true
    }
  },

  computed: {

    activeUser () {
      return this.$store.state.admin.activeUser
    },

    selected () {
      return this.activeUser?.id === this.user.id
    },

    displayName () {
      return zw.getDisplayName(this.user.value)
    }
  },

  methods: {

    handle (command) {
      this[command]()
    },

    edit () {
      this.$store.dispatch('admin/showUserForm', this.user)
    },

    delete () {
      // TODO
    },

    editAffiliations () {
      this.$store.dispatch('admin/setActiveUser', this.user)
      this.$store.dispatch('admin/setSecondaryPanel', 'zw-user-memberships')
    }
  }
}
</script>

<style>
.zw-user-item .user {
  display: flex;
  width: 92%;
}

.zw-user-item .user .name {
  flex-grow: 1;
}
</style>
