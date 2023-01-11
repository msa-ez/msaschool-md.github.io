---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# 쿠버네티스 유틸리티

# 쿠버네티스 유틸리티

## Helm 

Helm(패키지 인스톨러) 설치
- Helm 3.x 설치(권장)
```bash
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 > get_helm.sh
chmod 700 get_helm.sh
./get_helm.sh
```


## Kafka (namspace없이)
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install my-kafka bitnami/kafka
```

## Kafka (namespace)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
kubectl create ns kafka
helm install my-kafka bitnami/kafka --namespace kafka
```

### Kafka 메시지 확인하기  (namspace없이)
```bash
kubectl run my-kafka-client --restart='Never' --image docker.io/bitnami/kafka:2.8.0-debian-10-r0 --command -- sleep infinity
kubectl exec --tty -i my-kafka-client -- bash

# PRODUCER:
kafka-console-producer.sh \
		--broker-list my-kafka-0.my-kafka-headless.svc.cluster.local:9092 \
		--topic test

# CONSUMER:
kafka-console-consumer.sh --bootstrap-server my-kafka:9092 --topic test --from-beginning
```

### Kafka 메시지 확인하기  (kafka namespace)
```bash
kubectl run my-kafka-client --restart='Never' --image docker.io/bitnami/kafka:2.8.0-debian-10-r0 --namespace kafka --command -- sleep infinity
kubectl exec --tty -i my-kafka-client --namespace kafka -- bash

# PRODUCER:
kafka-console-producer.sh \
		--broker-list my-kafka-0.my-kafka-headless.kafka.svc.cluster.local:9092 \
		--topic test

# CONSUMER:
kafka-console-consumer.sh --bootstrap-server my-kafka.kafka:9092 --topic test --from-beginning
```

## HTTPie Pod
```bash
cat <<EOF | kubectl apply -f -
apiVersion: "v1"
kind: "Pod"
metadata: 
  name: httpie
  labels: 
    name: httpie
spec: 
  containers: 
    - 
      name: httpie
      image: clue/httpie
      command:
        - sleep
        - "36000"
EOF
```
생성후, 접속:
```bash
kubectl exec -it httpie bin/bash
```
## Seige Pod
```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: siege
spec:
  containers:
  - name: siege
    image: apexacme/siege-nginx
EOF
```
생성후, 접속:
```bash
kubectl exec -it siege bin/bash
```

## EBS CSI Driver install on EKS v1.23, or higher

먼저, 설치에 필요한 내 클러스터 정보를 설정한다.

```
export REGION=MY-REGION-CODE
export CLUSTER_NAME=MY-CLUSTER-NAME
export ROOT_ACCOUNT_UID=123456789012
```

### IAM Policy 생성 및 EKS 연동

- EKS Cluster가 설치되어 있어야 한다.

- 클러스터에 대한 IAM OpenID Connect(OIDC) 프로바이더를 먼저 설치한다.
```
eksctl utils associate-iam-oidc-provider --region=$REGION --cluster=$CLUSTER_NAME --approve
```
- EBS CSI Driver를 위한 IAM Policy, Role, Cluster Service Account를 생성한다.
```
eksctl create iamserviceaccount \
  --region $REGION \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster $CLUSTER_NAME \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --role-only \
  --role-name AmazonEKS_EBS_CSI_DriverRole
```

### EBS Storage 백업을 위한 Snapshot Component 생성

```
# Customresourcedefinition 생성
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotclasses.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotcontents.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshots.yaml

# Controller 생성
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml
```

### CSI-Driver add-on 설치
```
eksctl create addon --region $REGION --name aws-ebs-csi-driver --cluster $CLUSTER_NAME --service-account-role-arn arn:aws:iam::$ROOT_ACCOUNT_UID:role/AmazonEKS_EBS_CSI_DriverRole --force
```

### EBS CSI Driver 기반  gp3 StorageClass 등록

```
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
EOF
```

- 기존 gp2기반 Storage Class를 default 해제
```
kubectl patch storageclass gp2 -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```

- 설정 확인
```
kubectl get sc
```