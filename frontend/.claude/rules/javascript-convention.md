---
description: JavaScript/TypeScript 파일(.js, .ts, .tsx 제외) 작성 시
alwaysApply: false
---

# JavaScript Coding Convention

Airbnb 스타일 가이드 기반. 팀 일관성 확보용.

---

## 변수 선언

- **var 금지**, `const`/`let`만 사용
- 재할당 필요 없으면 `const`
- 루프/조건에서만 `let`

```js
// ✅ Good
const name = 'John';
let counter = 0;

// ❌ Bad
var name = 'John';
```

---

## 네이밍

- 클래스/컴포넌트: `PascalCase`
- 함수/변수/파일: `camelCase`
- 상수: `UPPER_CASE`
- 프라이빗: `_prefix`

```js
// ✅ Good
const MAX_SIZE = 100;
const userName = 'John';
function fetchData() {}

// ❌ Bad
const user_name = 'John';
function FetchData() {}
```

---

## 함수

- 화살표 함수 우선
- 부모 스코프 `this` 접근 필요 시만 일반 함수
- 짧으면 한 줄

```js
// ✅ Good
const add = (a, b) => a + b;
const greet = name => `Hello, ${name}`;

// ❌ Bad
const add = function(a, b) { return a + b; };
```

---

## 객체/배열

- Spread 연산자 `...` 사용
- 구조분해 할당

```js
// ✅ Good
const newUser = { ...user, age: 25 };
const { name, age } = user;
const [first, ...rest] = array;

// ❌ Bad
const newUser = Object.assign({}, user);
const name = user.name;
```

---

## 문자열

- Template literal 사용

```js
// ✅ Good
const msg = `Hello, ${name}!`;

// ❌ Bad
const msg = 'Hello, ' + name + '!';
```

---

## 루프

- `map/filter/reduce` 선호
- `forEach` 필요 시만
- `for-in` 금지

```js
// ✅ Good
const doubled = nums.map(n => n * 2);
const evens = nums.filter(n => n % 2 === 0);

// ❌ Bad
const doubled = [];
for (let i = 0; i < nums.length; i++) {
  doubled.push(nums[i] * 2);
}
```

---

## Optional Chaining

```js
// ✅ Good
const avatar = user?.profile?.avatar;
const count = array?.length ?? 0;

// ❌ Bad
const avatar = user && user.profile && user.profile.avatar;
```

---

## 비동기

- `async/await` 선호
- `.catch()` 항상 처리

```js
// ✅ Good
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

// ❌ Bad
function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(res => res.json());
}
```

---

## 주석/로그

- WHY만 주석으로 (WHAT은 코드가 말함)
- 배포 전 `console.log` 제거
- 주석처리 코드는 삭제

```js
// ✅ Good
// 사용자 권한이 없으면 조기 반환
if (!hasPermission) return null;

// ❌ Bad
// user 변수 선언
const user = getUser();
console.log('Debug:', user);
// const oldCode = {...};
```

---

## 파일 구조

- 한 파일 한 책임 (모듈)
- 임포트 → 상수 → 함수 → 내보내기 순서
- 관련 함수는 폴더/index로 그룹화

```js
// ✅ Good structure
utils/
├── date.js
├── string.js
├── index.js  // export from './date' 등

// 사용
import { formatDate } from '@/utils';
```

---

## 에러 처리

- 모든 Promise에 `.catch()` 또는 try/catch
- 사용자 친화적 에러 메시지
- 민감한 정보 노출 금지

```js
// ✅ Good
try {
  const data = await api.fetch();
} catch (error) {
  console.error('Request failed');
  throw new Error('Failed to load data');
}

// ❌ Bad
const data = await api.fetch(); // 에러 처리 없음
```

---

## 체크리스트

- [ ] var 사용 안 함?
- [ ] camelCase/PascalCase 구분?
- [ ] 화살표 함수 사용?
- [ ] Spread/구조분해 활용?
- [ ] Template literal 사용?
- [ ] map/filter/reduce 선호?
- [ ] Optional chaining 사용?
- [ ] async/await 사용?
- [ ] console.log 제거?
- [ ] 주석처리 코드 삭제?
