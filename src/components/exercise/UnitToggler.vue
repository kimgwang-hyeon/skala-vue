<script setup>
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">날씨 단위: {{ configStore.unitSymbol }}</span>
    <button class="unit-toggler-button" type="button" @click="configStore.toggleUnit">
      단위 변경
    </button>
  </div>
</template>
