---
description: ''
sidebar: 'business'
---

# [이벤트스토밍] DDD 구글 드라이브 예제

### 구글 드라이브 예제
#### 아래 시나리오대로  이벤트 스토밍 하시오.
(eventstorming 수준: Design level)

1. 사용자가 파일을 업로드한다
1. 파일이 업로드 될때 마다, 파일의 위치를 파일 이름으로 인덱싱한다
1. 업로드된 파일이 비디오 인 경우, 파일을 비디오 스트리밍 처리한다 (결과는 비디오 스트림 서비스 접속 url)
1. 파일이 업로드 될때와, 비디오로 생성되었을 때, 파일을 업로드한 유저에게 노티가 된다
1. 대시보드에서는 업로드 시킨 파일의 상태 (파일사이즈, 파일명, 인덱싱여부, 업로드여부, 비디오 url) 가 표시된다.

#### Project Name : google drive

#### 바운디드 컨텍스트
1. dashboard
2. drive
3. indexer
4. video processing
5. notification
