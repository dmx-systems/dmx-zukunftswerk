<template>
  <div class="zw-color-selector field">
    <div class="field-label"><zw-string>label.color</zw-string></div>
    <el-dropdown size="medium" trigger="click" @command="setColor">
      <el-button type="text">
        <div :class="colorBoxClass(color)" :style="{'background-color': color}"></div><!--
        --><span class="el-icon-arrow-down el-icon--right"></span>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="color in colors" :command="color" :key="color">
          <div :class="colorBoxClass(color)" :style="{'background-color': color}"></div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import zw from '../zw-globals'

export default {

  data () {
    return {
      color: this.value,              // selected color
      colors: zw.ITEM_COLORS          // all colors
    }
  },

  props: {
    value: {                          // initial color
      type: String,
      required: true
    }
  },

  methods: {

    setColor (color) {
      this.color = color
      this.$emit('input', color)
    },

    colorBoxClass (color) {
      const classes = ['color-box']
      if (color === 'white' || color === 'transparent') {     // 'white' and 'transparent' get extra style
        classes.push(color)
      }
      return classes
    }
  }
}
</script>

<style>
.zw-color-selector .color-box {
  display: inline-block;
  width: 40px;
  height: 30px;
  border: 1px dashed var(--highlight-color);
}

.zw-color-selector .el-icon-arrow-down {
  vertical-align: top;
}

/* dropdown menus are body mounted */
body > .el-dropdown-menu .color-box {
  margin-top: 9px;
  width: 40px;
  height: 30px;
}

body > .el-dropdown-menu .color-box.white,
body > .el-dropdown-menu .color-box.transparent {
  border: 1px solid var(--border-color-lighter);
}

.zw-color-selector .color-box.transparent,
body > .el-dropdown-menu .color-box.transparent {
  background-image: url("../../resources-build/grid.png");
  background-position: bottom right;
  background-size: 12px;
}
</style>
