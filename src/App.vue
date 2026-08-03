<script setup>
import ReactiveRef from './components/practices/composition/ReactiveRef.vue'
import ReactiveReactive from './components/practices/composition/ReactiveReactive.vue'

// 💡 새로운 실습 컴포넌트를 작성한 후 아래와 같이 import하여 등록할 수 있습니다.
// import VueComputed from './components/practices/composition/VueComputed.vue'
</script>

<template>
  <div class="container">
    <h1>Vue3 Composition API 실습 노트</h1>

    <!-- 섹션 1 -->
    <section class="card">
      <h2>1. 반응형 상태 ref() 기초</h2>
      <p>ref()를 활용한 단일 값 및 객체/배열 반응형 상태 관리 예제입니다.</p>
      <ReactiveRef />
    </section>

    <!-- 섹션 2 -->
    <section class="card">
      <h2>2. 반응형 상태 reactive() 특징 및 활용</h2>
      <p>reactive()를 활용한 객체 및 배열 상태 관리와 특징 예제입니다.</p>
      <ReactiveReactive />
    </section>

    <!-- 💡 새로운 실습 항목 추가 시 아래 주석을 참고하여 섹션을 추가하세요. -->
    <!--
    <section class="card">
      <h2>3. 실습 제목</h2>
      <p>실습에 대한 주요 설명입니다.</p>
      <NewComponent />
    </section>
    -->
  </div>
</template>

<style>
/* 외부 기본 실습 공통 스타일 적용 */
@import '@/assets/practice.css';
</style>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

h1 {
  text-align: center;
  color: #42b883;
  margin-top: 10px;
  margin-bottom: 30px;
  font-weight: 800;
}

.card {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  background-color: #ffffff;
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.card h2 {
  margin-top: 0;
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 700;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.card p {
  color: #475569;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.card :deep(.practice-section) {
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
}

.card :deep(.practice-section > h2) {
  display: none;
}

.card :deep(button) {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #f1f5f9;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 6px;
  margin-bottom: 6px;
}

.card :deep(button:hover) {
  background-color: #e2e8f0;
}

.card :deep(button:disabled) {
  background-color: #e2e8f0;
  color: #94a3b8;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>

