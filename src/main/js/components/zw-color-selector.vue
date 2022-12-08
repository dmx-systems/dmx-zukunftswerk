<template>
  <div class="field zw-color-selector">
    <div class="field-label"><zw-string>label.color</zw-string></div>
    <el-dropdown size="medium" trigger="click" @command="setColor">
      <el-button type="text">
        <div class="color-box" :style="{'background-color': color}"></div><!--
        --><span class="el-icon-arrow-down el-icon--right"></span>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="(color, i) in colors" :command="color" :key="color">
          <div :class="colorBoxClass(color, i)" :style="{'background-color': color}"></div>
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
      color: this.value,              // color menu model
      colors: zw.ITEM_COLORS          // all colors
    }
  },

  props: {
    value: {                          // the initial color
      type: String,
      required: true
    }
  },

  methods: {

    setColor (color) {
      this.color = color
      this.$emit('input', color)
    },

    colorBoxClass (color, i) {
      const classes = ['color-box']
      if (i === 0 || i === 6) {       // 'white' and 'transparent' color-boxes need specific style
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

body > .el-dropdown-menu .color-box.transparent {
  background-image: url("../../resources-build/grid.png");
  background-position: bottom right;
  background-size: 12px;
}
</style>
