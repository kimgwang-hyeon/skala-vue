<script setup>
// 부모가 전달하는 카드 제목 Props
defineProps({
  title: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section class="dashboard-card" :class="{ 'is-compact': compact }">
    <header class="dashboard-card-header">
      <div>
        <p v-if="eyebrow" class="dashboard-card-eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
        <p v-if="description" class="dashboard-card-description">{{ description }}</p>
      </div>

      <div v-if="$slots.actions" class="dashboard-card-header-actions">
        <slot name="actions"></slot>
      </div>
    </header>

    <div class="dashboard-card-content">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="dashboard-card-footer">
      <slot name="footer"></slot>
    </footer>
  </section>
</template>
