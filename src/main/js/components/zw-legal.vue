<template>
  <div :class="['zw-legal', routeName, lang]">
    <zw-language-switch></zw-language-switch>
    <img :src="logo">
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
    },

    lang () {
      return this.$store.state.lang
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

.zw-legal img {
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
  font-size: 20px;
  margin-top: 42px;
}

.zw-legal .scroll-container {
  overflow: auto;
  flex-grow: 1;
  margin-top: 24px;
  padding-right: 36%;
}

.zw-legal .text {
  color: white;
  margin-bottom: 24px;
}

.zw-legal.privacy_policy.de p.p4 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 10.0px Times}
.zw-legal.privacy_policy.de p.p6 {margin: 0.0px 0.0px 15.0px 0.0px; font: 10.0px Times}
.zw-legal.privacy_policy.de p.p7 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 10.0px Times; min-height: 13.0px}
.zw-legal.privacy_policy.de p.p8 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Arial}
.zw-legal.privacy_policy.de p.p9 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Arial; min-height: 11.0px}
.zw-legal.privacy_policy.de p.p10 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px Times}
.zw-legal.privacy_policy.de p.p11 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 10.0px Times; min-height: 13.0px}
.zw-legal.privacy_policy.de p.p12 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 10.0px 'Times New Roman'}
.zw-legal.privacy_policy.de p.p13 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 10.0px 'Times New Roman'; min-height: 11.0px}
.zw-legal.privacy_policy.de p.p14 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Times}
.zw-legal.privacy_policy.de p.p15 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Times; min-height: 13.0px}
.zw-legal.privacy_policy.de p.p16 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Times}
.zw-legal.privacy_policy.de p.p17 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px Times; min-height: 16.0px}
.zw-legal.privacy_policy.de p.p18 {margin: 0.0px 0.0px 15.0px 0.0px; font: 12.0px Times}
.zw-legal.privacy_policy.de p.p19 {margin: 0.0px 0.0px 15.0px 0.0px; font: 12.0px Times; min-height: 14.0px}
.zw-legal.privacy_policy.de p.p21 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 13.0px Times; min-height: 16.0px}
.zw-legal.privacy_policy.de span.s1 {text-decoration: underline}
.zw-legal.privacy_policy.de span.s2 {font: 10.0px Times}
.zw-legal.privacy_policy.de span.s3 {font: 10.0px Arial; text-decoration: underline}
.zw-legal.privacy_policy.de table.t1 {border-collapse: collapse}
.zw-legal.privacy_policy.de td.td1 {border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #bfbfbf #bfbfbf #bfbfbf #bfbfbf; padding: 0.0px 5.0px 0.0px 5.0px}

.zw-legal.privacy_policy.fr p.p4 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 10.0px Times}
.zw-legal.privacy_policy.fr p.p6 {margin: 0.0px 0.0px 15.0px 0.0px; font: 10.0px Times}
.zw-legal.privacy_policy.fr p.p7 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 10.0px Times; min-height: 13.0px}
.zw-legal.privacy_policy.fr p.p8 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Arial}
.zw-legal.privacy_policy.fr p.p9 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Arial; min-height: 11.0px}
.zw-legal.privacy_policy.fr p.p10 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px Times}
.zw-legal.privacy_policy.fr p.p11 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 10.0px Times; min-height: 13.0px}
.zw-legal.privacy_policy.fr p.p12 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 10.0px 'Times New Roman'}
.zw-legal.privacy_policy.fr p.p13 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 10.0px 'Times New Roman'; min-height: 11.0px}
.zw-legal.privacy_policy.fr p.p14 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Times}
.zw-legal.privacy_policy.fr p.p15 {margin: 0.0px 0.0px 0.0px 0.0px; font: 10.0px Times; min-height: 13.0px}
.zw-legal.privacy_policy.fr p.p16 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Times}
.zw-legal.privacy_policy.fr p.p17 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px Times; min-height: 16.0px}
.zw-legal.privacy_policy.fr p.p18 {margin: 0.0px 0.0px 15.0px 0.0px; font: 12.0px Times}
.zw-legal.privacy_policy.fr p.p19 {margin: 0.0px 0.0px 15.0px 0.0px; font: 12.0px Times; min-height: 14.0px}
.zw-legal.privacy_policy.fr p.p21 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 13.0px Times; min-height: 16.0px}
.zw-legal.privacy_policy.fr span.s1 {font: 10.0px Times}
.zw-legal.privacy_policy.fr span.s2 {text-decoration: underline}
.zw-legal.privacy_policy.fr span.s3 {font: 10.0px Arial}
.zw-legal.privacy_policy.fr span.s4 {font: 10.0px Arial; text-decoration: underline}
.zw-legal.privacy_policy.fr table.t1 {border-collapse: collapse}
.zw-legal.privacy_policy.fr td.td1 {border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #bfbfbf #bfbfbf #bfbfbf #bfbfbf; padding: 0.0px 5.0px 0.0px 5.0px}
</style>
