---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Kafka 기본 명령어 (New)

# Kafka 기본 명령어 (New)

### Kafka 기본 명령 이해하기

- IDE 를 실행하기 위하여 CODE > Project IDE 를 선택하여 gitpod 에 접속한다.
- kafka 를 docker를 통하여 실행한다:
```
cd kafka
docker-compose up
```
> kafka 는 zookeeper 서버와 함께 2개의 프로세스로 기동된다.
> docker-compose file 은 하나 이상의 docker 서비스를 실행관리할 때 사용된다.

- kafka 유틸리티가 포함된 위치에 접속하기 위하여 docker 를 통하여 shell 에 진입한다:
```
cd kafka
docker-compose exec -it kafka /bin/bash
cd /bin
```

- 토픽생성
```bash
./kafka-topics --bootstrap-server http://localhost:9092 --topic example --create --partitions 1 --replication-factor 1
```

- 토픽 리스트 보기
```bash
./kafka-topics --bootstrap-server http://localhost:9092 --list    
```

- 새로운 터미널 창에서 kafka producer 연결 후 메세지 publish

```bash
./kafka-console-producer --broker-list http://localhost:9092 --topic example
```

- 새로운 터미널 창에서 kafka consumer 연결 후 메세지 subscribe
```bash
./kafka-console-consumer --bootstrap-server http://localhost:9092 --topic example --from-beginning
```
- hello world 라는 메세지 publish 해보기 

### Kafka Consumer Group & Offsets

- consumer group 목록
```bash
./kafka-consumer-groups --bootstrap-server http://localhost:9092 --list
```
- consumer group 의 offset 확인
```bash
./kafka-consumer-groups --bootstrap-server http://localhost:9092 --group <group_id> --describe
```
- consumer group 의 offset 재설정
```bash
./kafka-consumer-groups --bootstrap-server http://localhost:9092 --group <group_id> --topic example --reset-offsets --to-earliest --execute
```



> There are many other resetting options, run kafka-consumer-groups for details:

```bash
 --shift-by <positive_or_negative_integer>
 --to-current
 --to-latest
 --to-offset <offset_integer>
 --to-datetime <datetime_string>
 --by-duration <duration_string>
```


## 카프카의 로컬 설치

- Kafka Download
```
wget https://dlcdn.apache.org/kafka/3.1.0/kafka_2.13-3.1.0.tgz
tar -xf kafka_2.13-3.1.0.tgz
```

- Run Kafka
```
cd kafka_2.13-3.1.0/
bin/zookeeper-server-start.sh config/zookeeper.properties &
bin/kafka-server-start.sh config/server.properties &
```

- Kafka Event 컨슈밍하기 (별도 터미널)
```
cd kafka_2.13-3.1.0/
bin/kafka-console-consumer.sh --bootstrap-server 127.0.0.1:9092 --topic petstore
```
