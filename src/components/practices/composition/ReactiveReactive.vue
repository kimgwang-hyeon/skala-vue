<script setup>
import { reactive, toRefs } from 'vue'

// 1. 객체형 reactive 상태
const userReactive = reactive({
  name: '이순신',
  age: 30,
})
const celebrateReactive = () => {
  userReactive.age++
}

// 2. 배열형 reactive 상태
const items = reactive(['사과', '바나나'])
// 배열 요소 추가
const addItem = () => {
  items.push(`과일 ${items.length + 1}`)
}
// 배열 요소 삭제
const removeItem = (index) => {
  items.splice(index, 1)
}

// 3. reactive()의 단점 / 주의사항 실습
// (1) 객체 통째 재할당 시 반응성 파괴 현상
let stateReassign = reactive({ count: 10 })

const increaseCountReassign = () => {
  // 현재 stateReassign 변수가 가리키는 객체의 count 증가
  stateReassign.count++
}

const replaceObjectWrong = () => {
  // ⚠️ 잘못된 방법: reactive 객체 전체를 새 객체로 덮어쓰면 기존 Proxy 추적 연결이 끊어짐
  stateReassign = reactive({ count: 999 })
  console.log('재할당 후 JS 변수의 count 값:', stateReassign.count)
}

const replaceObjectCorrect = () => {
  // ✅ 올바른 방법: Object.assign()을 활용하여 내부 속성만 갱신
  Object.assign(stateReassign, { count: 999 })
}

// (2) 구조 분해 할당(Destructuring) 시 반응성 상실 및 toRefs() 해결법
const stateDestruct = reactive({ name: '강감찬', score: 100 })

// ⚠️ 구조 분해 할당 시 단순 원시값으로 추출되어 반응성 연결이 끊김
let { score: wrongScore } = stateDestruct

// ✅ toRefs()를 사용하면 반응성을 유지한 ref 객체 세트로 변환됨
const { score: correctScore } = toRefs(stateDestruct)

const increaseScore = () => {
  stateDestruct.score += 10
}
</script>

<template>
  <div class="practice-section">
    <h2>반응형 상태 reactive() 특징 및 주의점</h2>

    <h3>1) 객체(Object) reactive</h3>
    <p>이름: {{ userReactive.name }} / 나이: {{ userReactive.age }}세</p>
    <button @click="celebrateReactive">reactive 나이 한 살 추가</button>

    <h3>2) 배열(Array) reactive</h3>
    <ul>
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
        <button @click="removeItem(index)" style="margin-left: 8px; padding: 2px 6px">삭제</button>
      </li>
    </ul>
    <button @click="addItem">과일 항목 추가</button>

    <hr />

    <h3>3) ⚠️ reactive()의 단점 및 주의사항</h3>

    <div style="background-color: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #e2e8f0">
      <h4 style="margin-top: 0; color: #e11d48">① 객체 통째로 재할당 시 반응성 파괴</h4>
      <p>
        현재 템플릿 화면 count: <strong>{{ stateReassign.count }}</strong>
      </p>
      <button @click="increaseCountReassign">count 1 증가</button>
      <button @click="replaceObjectWrong" style="margin-left: 6px">⚠️ 잘못된 객체 재할당 (state = { count: 999 })</button>
      <button @click="replaceObjectCorrect" style="margin-left: 6px">✅ 올바른 객체 갱신 (Object.assign)</button>
    </div>

    <div style="background-color: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0">
      <h4 style="margin-top: 0; color: #e11d48">② 구조 분해 할당(Destructuring) 시 반응성 파괴</h4>
      <p>
        원본 score: <strong>{{ stateDestruct.score }}</strong>
      </p>
      <p>⚠️ 일반 구조분해 변수(wrongScore): {{ wrongScore }} (원본 수정 시 갱신 안 됨)</p>
      <p>✅ toRefs() 구조분해 변수(correctScore): {{ correctScore }} (원본 수정 시 자동 갱신)</p>
      <button @click="increaseScore">원본 점수 +10 증가</button>
    </div>
  </div>
</template>

