<template>
  <Transition name="fade">
    <a-button v-if="visible" type="primary" class="back-to-top" @click="scrollToTop">
      <a-flex justify="space-between" align="center" style="padding: 0px 8px;">
        <UpCircleOutlined />
        <span>回到顶部</span>
      </a-flex>
    </a-button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { UpCircleOutlined } from '@ant-design/icons-vue'

const visible = ref(false)

function checkScroll() {
  visible.value = window.scrollY > 200
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  width: 128px;
  height: 48px;
  border-radius: 10px;
}
</style>
