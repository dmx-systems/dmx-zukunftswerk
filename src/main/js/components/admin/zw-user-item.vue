<template>
  <el-collapse-item :class="['zw-user-item', {'zw-selected': selected}]" :name="user.value">
    <div class="user" slot="title">
      <div class="name">{{displayName}} ({{user.value}})</div>
      <el-dropdown size="medium" trigger="click" @command="handle" @click.native.stop>
        <el-button type="text" class="fa fa-fw fa-ellipsis-v"></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="edit">
            <i class="fa fa-fw fa-pencil"></i><zw-string>action.edit_user</zw-string>
          </el-dropdown-item>
          <el-dropdown-item command="delete">
            <i class="fa fa-fw fa-trash"></i><zw-string>action.delete_user</zw-string>
          </el-dropdown-item>
          <el-dropdown-item command="editAffiliations" divided>
            <i class="fa fa-fw fa-list"></i><zw-string>action.edit_affiliations</zw-string>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div v-for="workspace in user.memberships">{{workspace.value}}</div>
  </el-collapse-item>
</template>

<script>
export default {

  props: {
    user: {      // plain Username topic
      type: Object,
      required: true
    }
  },

  computed: {

    displayName () {
      return this.user.children['zukunftswerk.display_name']?.value || '?'     // TODO
    },

    activeUser () {
      return this.$store.state.admin.activeUser
    },

    selected () {
      return this.activeUser?.id === this.user.id
    }
  },

  methods: {

    handle (command) {
      this[command]()
    },

    edit () {
      // TODO
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
