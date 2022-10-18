<template>
  <div class="zw-canvas-search">
    <el-input v-model="search"></el-input>
    <el-button type="text" icon="el-icon-arrow-up"></el-button>
    <el-button type="text" icon="el-icon-arrow-down"></el-button>
  </div>
</template>

<script>

export default {
  data () {
    return {
      search: ''
    }
  }
}
</script>

<style>
.zw-canvas-search {
  display: inline-block;
}

.zw-canvas-search .el-input {
  width: 180px;
  vertical-align: super;
}

.zw-canvas-search .el-input__inner {
  height: 32px;
}

.zw-canvas-search .el-button {
  margin-left: 5px !important;
}
</style>
