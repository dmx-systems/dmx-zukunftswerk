<template>
  <el-collapse-item :class="['zw-user-item', {'zw-selected': selected}]" :name="user.id">
    <div class="user" slot="title">
      <div class="name">{{user.value}}</div>
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
    <!-- TODO div v-for="username in workspace.memberships">{{username.value}}</div-->
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
      // TODO
      // this.$store.dispatch('admin/setActiveWorkspace', this.workspace)
      // this.$store.dispatch('admin/setSecondaryPanel', 'zw-membership-form')
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
