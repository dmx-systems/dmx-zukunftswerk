<template>
  <div class="zw-admin">
    <div class="nav-bar">
      <el-button :class="['fa', 'fa-list', {'zw-selected': area1}]" type="text" @click="goArea1"></el-button>
      <el-button :class="['fa', 'fa-users', {'zw-selected': area2}]" type="text" @click="goArea2"></el-button>
      <div class="gap"></div>
      <el-button class="close-button fa fa-times-circle-o" v-if="showClose" type="text" @click="close"></el-button>
    </div>
    <component class="primary-panel" :is="primaryPanel"></component>
    <component class="secondary-panel" :is="secondaryPanel" v-loading="loading" @loading="startLoading"
      @complete="stopLoading">
    </component>
  </div>
</template>

<script>
export default {

  data () {
    return {
      loading: false
    }
  },

  computed: {

    area1 () {
      return this.primaryPanel === 'zw-workspace-list'
    },

    area2 () {
      return this.primaryPanel === 'zw-user-list'
    },

    primaryPanel () {
      return this.$store.state.admin.primaryPanel
    },

    secondaryPanel () {
      return this.$store.state.admin.secondaryPanel
    },

    workspace () {
      return this.$store.state.workspace
    },

    showClose () {
      return this.workspace !== undefined
    }
  },

  methods: {

    goArea1 () {
      this.$store.dispatch('admin/setPrimaryPanel', 'zw-workspace-list')
    },

    goArea2 () {
      this.$store.dispatch('admin/setPrimaryPanel', 'zw-user-list')
    },

    close () {
      this.$store.dispatch('callWorkspaceRoute')
    },

    startLoading () {
      this.loading = true
    },

    stopLoading () {
      this.loading = false
    }
  },

  components: {
    'zw-workspace-list': require('./zw-workspace-list').default,
    'zw-workspace-form': require('./zw-workspace-form').default,
    'zw-workspace-memberships': require('./zw-workspace-memberships').default,
    'zw-user-list': require('./zw-user-list').default,
    'zw-user-form': require('./zw-user-form').default,
    'zw-user-memberships': require('./zw-user-memberships').default
  }
}
</script>

<style>
.zw-admin {
  display: flex;
  flex-grow: 1;
  min-height: 0;
}

.zw-admin .nav-bar {
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  padding: 20px 6px 6px 6px;
  flex-basis: 30px;
}

.zw-admin .nav-bar .el-button {
  font-size: 16px;
  line-height: 1.5;
}

.zw-admin .nav-bar .el-button.zw-selected {
  background-color: white;
}

.zw-admin .nav-bar .el-button + .el-button {
  margin-top: 10px;
  margin-left: 0;
}

.zw-admin .nav-bar .close-button {
  font-size: 20px;
}

.zw-admin .nav-bar .gap {
  flex-grow: 1;
}

.zw-admin .primary-panel {
  display: flex;
  flex-direction: column;
  flex-basis: 50%;
  min-width: 0;
  padding: 35px;
}

.zw-admin .primary-panel .heading {
  font-size: 20px;
  margin-bottom: 28px;
}

.zw-admin .primary-panel .scroll-container {
  overflow: auto;
}

.zw-admin .primary-panel .add-button {
  margin-top: 34px;
  align-self: flex-start;
}

.zw-admin .secondary-panel {
  flex-grow: 1;
  padding: 35px;
  background-color: var(--background-color);
}

.zw-admin .secondary-panel .heading {
  font-size: 20px;
  margin-bottom: 22px;
}

.zw-admin .secondary-panel .submit-button {
  margin-top: 26px;
}

/* override Element UI style */
.zw-admin .el-collapse-item__content {
  margin-left: 24px;
}
</style>
