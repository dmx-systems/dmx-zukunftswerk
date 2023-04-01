<template>
  <div :class="['zw-legal', routeName]">
    <zw-language-switch></zw-language-switch>
    <el-button class="home-button" type="text" @click="home"><img :src="logo"></el-button>
    <zw-string class="heading">{{heading}}</zw-string>
    <div class="scroll-container dmx-html-field">
      <zw-string class="text" :html="true">{{routeName}}</zw-string>
    </div>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/logo').default
  ],

  computed: {

    heading () {
      return 'label.' + this.routeName
    },

    routeName () {
      return this.router.currentRoute.name
    },

    router () {
      return this.$store.state.routerModule.router
    }
  },

  methods: {

    home () {
      this.$store.dispatch('callRootRoute')
    }
  }
}
</script>

<style>
.zw-legal {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background-color: black;
  background-image: url("../../resources-build/zw-snake.png");
  background-position: bottom right;
  background-repeat: no-repeat;
  padding: 50px 0 0 120px;
}

.zw-legal .home-button {
  align-self: flex-start;
  margin-left: -81px;
}

.zw-legal .zw-language-switch {
  position: absolute;
  top: 16px;
  right: 16px;
}

.zw-legal .heading {
  color: var(--primary-color);
  font-size: 24px;
  margin-top: 42px;
}

.zw-legal .scroll-container {
  overflow: auto;
  flex-grow: 1;
  margin-top: 24px;
  padding-right: 34%;
}

.zw-legal .text {
  color: white;
  margin-bottom: 24px;
}

.zw-legal.privacy_policy h2 {
  font-size: 20px;
  line-height: normal;
  margin-top: 32px;
  margin-bottom: 14px;
}

.zw-legal.privacy_policy ol {
  list-style-type: lower-alpha;
}

.zw-legal.privacy_policy p,
.zw-legal.privacy_policy ul > li {
  font-family: serif;
  text-align: justify;
}

.zw-legal.privacy_policy table {
  border-collapse: collapse;
  margin-bottom: 2em;
}

.zw-legal.privacy_policy table td {
  border: 1px solid #bfbfbf;
  padding: 10px;
}

.zw-legal.privacy_policy table td p {
  text-align: initial;
}

.zw-legal.privacy_policy ul > li {
  margin-top: 4px;
  margin-bottom: 4px;
}

.zw-legal.privacy_policy ol > li {
  margin-top: 12px;
  margin-bottom: 12px;
}

.zw-legal.privacy_policy ol > li > div {
  font-weight: bold;
  margin-bottom: 4px;
}
</style>
