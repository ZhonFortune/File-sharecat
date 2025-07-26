<template>
  <a-config-provider :theme="{
    token: {
      colorPrimary: '#1f1f1f',
    },
  }">
  </a-config-provider>

  <a-space direction="vertical" :style="{ width: '100%', height: '100%' }">
    <a-layout>
      <a-layout-header v-if="!hiddenHeaderAndFooter" :style="{ background: 'transparent', padding: '0' }">
        <Header />
      </a-layout-header>

      <a-layout-content :style="{ minHeight: '100vh' }">
        <Debug id="Debug" :style="debugStyle" display="none" />
        <router-view />
      </a-layout-content>

      <a-layout-footer v-if="!hiddenHeaderAndFooter"
        :style="{ background: 'rgb(242 242 242)', padding: '40px 0px', marginTop: '40px' }">
        <Footer />
        <!-- <Button type="primary" @click='test'>Primary Button</Button> -->
      </a-layout-footer>
    </a-layout>
  </a-space>
</template>

<script setup>
import { ref, computed , watch} from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Debug from '@/components/Debug.vue'
import Footer from '@/components/Footer.vue'

const hiddenHeaderAndFooter = ref(false)

const route = useRoute()

watch(route, (to) => {
  hiddenHeaderAndFooter.value = to.meta.hiddenLayout === true
}, { immediate: true }) // 页面初次加载也触发一次

const debugStatus = ref(false)
const debugStyle = computed(() => {
  return {
    display: debugStatus.value ? 'block' : 'none'
  }
})

</script>

<style scoped></style>
