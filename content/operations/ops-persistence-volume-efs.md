---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# 파일공유를 위한 NAS 스토리지 생성과 설정

# 파일공유를 위한 NAS 스토리지 생성과 설정

### 여러 서비스간 파일공유를 위한 NFS 생성과 설정

이번 랩에서는 여러 마이크로서비스간 파일 공유를 위해 일반적으로 NAS(Network Attached Storage)로 알려진 NFS 파일시스템을 AWS 클라우드에 생성하고, 이를 주문서비스에서 마운트시켜 스토리지로 활용하는 예제를 실습한다.


#### StorageClass (Dynamic PV Provisioning) 확인
```
kubectl get storageclass
```
- 아래와 같은 결과가 출력되었는지 확인해 줍니다.
```
NAME            PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
gp2 (default)   kubernetes.io/aws-ebs   Delete          WaitForFirstConsumer   false                  2d1h
```


### 1. 관리콘솔을 통한 파일시스템 생성

NFS 파일시스템은 AWS CLI(https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/efs-csi.html)로도 가능하나 본랩에서는 교재를 참조하여 관리콘솔을 통해 생성해 본다. 

파일시스템 생성 후, 아래 순서에 따라 차례대로 EFS 프로비저너를 등록한다.



### 2. 프로비저너 등록 및 볼륨 생성

####  EFS 연계를 위한 EKS 계정 생성 및 Role 설정
- ServerAccount 생성
```
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: efs-provisioner
EOF	
```

#### 서비스 계정(efs-provisioner)에 권한(rbac) 설정
```
kubectl apply -f https://raw.githubusercontent.com/event-storming/container-orchestration/master/yaml/volume/aws/efs-rbac.yaml
```

#### EKS에 EFS 프로비저너 설치

- 아래 YAML 을 복사하여 efs-provisioner.yaml로 붙여넣기 한다.
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: efs-provisioner
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: efs-provisioner
  template:
    metadata:
      labels:
        app: efs-provisioner
    spec:
      serviceAccount: efs-provisioner
      containers:
        - name: efs-provisioner
          image: quay.io/external_storage/efs-provisioner:latest
          env:
            - name: FILE_SYSTEM_ID
              value: # {efs system id}
            - name: AWS_REGION
              value: # {region code}
            - name: PROVISIONER_NAME
              value: my-aws.com/aws-efs
          volumeMounts:
            - name: pv-volume
              mountPath: /persistentvolumes
      volumes:
        - name: pv-volume
          nfs:
            server: # {efs dns server name}
            path: /
```

- 이 중, FILE_SYSTEM_ID, AWS_REGION, volumes.nfs.server 정보를 커스터마이징한다.
> value: #`{efs system id}` => 파일 시스템 ID
> value: # `{aws region}` => EKS 리전
> server: # `{file-system-id}`.efs.`{aws-region}`.amazonaws.com

- NFS 생성을 위한 Provisioner를 설치한다.
```
kubectl apply -f efs-provisioner.yaml
```

- 생성된 Provisioner를 StorageClass에  등록
```
kubectl apply -f - <<EOF
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: aws-efs
provisioner: my-aws.com/aws-efs
EOF
```

```
kubectl get sc
```
- 아래와 같은 결과가 출력되었는지 확인해 줍니다.
```
NAME            PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
aws-efs         my-aws.com/aws-efs      Delete          Immediate              false                  4s
gp2 (default)   kubernetes.io/aws-ebs   Delete          WaitForFirstConsumer   false                  2d2h
```

#### EFS Provisioner를 사용하는 pvc 생성
```
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: aws-efs
  labels:
    app: test-pvc
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 1Mi
  storageClassName: aws-efs
	EOF
```

- 아래와 같은 결과가 출력되었는지 확인해 줍니다.
> persistentvolumeclaim/aws-efs created

#### pvc 조회
```
kubectl get pvc
```
- 아래와 같은 결과가 출력되었는지 확인해 줍니다.
```
NAME      STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
aws-efs   Bound                                        aws-efs        59s
```

####  NFS 볼륨을 가지는 주문마이크로서비스 배포

```
kubectl apply -f - <<EOF
kind: Pod
apiVersion: v1
metadata:
  name: order
spec:
  containers:
  - name: order
    image: ghcr.io/acmexii/order-liveness:latest
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 250m
        memory: 256Mi
    volumeMounts:
    - mountPath: "/mnt/data"
      name: volume
  volumes:
    - name: volume
      persistentVolumeClaim:
        claimName: aws-efs
EOF
```

- 배포 후 주문 컨테이너에 접속하여 제대로 파일시스템이 마운트되었는지 확인한다.
```
kubectl exec -it [ORDER POD 객체] -- /bin/sh
ls /mnt/data
```