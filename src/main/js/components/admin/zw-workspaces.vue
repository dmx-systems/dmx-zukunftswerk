<template>
  <div class="zw-workspaces">
    <div class="heading"><zw-string>label.admin_workspaces</zw-string></div>
    <div v-for="workspace in workspaces">{{workspace.value}}</div>
  </div>
</template>

<script>
export default {

  created () {
    this.$store.dispatch('admin/fetchWorkspaces')
  },

  data () {
    return {
    }
  },

  computed: {
    workspaces () {
      return this.$store.state.admin.workspaces
    }
  },

  methods: {
  }
}
</script>

<style>
.zw-workspaces {
  flex-grow: 1;
  padding: 24px;
}

.zw-workspaces .heading {
  font-size: 20px;
  margin-bottom: 20px;
}
</style>
