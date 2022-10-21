---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# 쿠버네티스 내부구조 분석

# 쿠버네티스 내부구조 분석

### Kubernetes Installation 
#### Preparing a VM & Connect

1. Prepare any Cloud VM(EC2, Agent, Compute Engine)

- 아마존 콘솔 접속
- 서비스 검색 > "EC2" 선택
- 실행중인스턴스 > "인스턴스 시작"
- Ubuntu Server 20.04 LTS 선택
- t2.micro 선택 
- 검토 및 시작
- 새 키 페어 생성 "ubuntu" > 다운로드
- 인스턴스 시작

> 보안 그룹명이 충돌나는 경우 임의의 보안그룹 명으로 변경합니다.

- 인스턴스 목록 > 생성한 인스턴스 선택 > 연결

- 받은 pem 파일을 개발 환경에 업로드 :   File Menu > UploadFiles...
- chmod 400 ubuntu.pem

1. Connect to VM (here, aws EC2 Linux-AMI)

    ```bash
    ssh -i ./k8s.pem ubuntu@ec2-3-35-209-101.ap-northeast-2.compute.amazonaws.com
    ```

1. Set root passwd and switching User to root

    ```bash
    sudo passwd root
    su -
    ```

1. Update and upgrade Ubuntu:

    ```bash
    apt update
    apt upgrade -y
    ```

### Install K8s Binaries

The next steps will prepare CRI and Software for kube setup.

1. 도커엔진을 설치:

    ```bash
    apt install docker.io -y
    ```

1. K8s 의 바이너리 파일을 다운 받는다:

    ```bash
    wget https://storage.googleapis.com/kubernetes-release/release/v1.9.11/kubernetes-server-linux-amd64.tar.gz
    tar -xzf kubernetes-server-linux-amd64.tar.gz
    ```

1. Install the K8s binaries:

    ```bash
    cd kubernetes/server/bin/
    mv kubectl kubelet kube-apiserver kube-controller-manager kube-scheduler kube-proxy /usr/bin/
    cd
    ```

1.  `kubectl` 이 실행되는지 확인한다:

    ```bash
    kubectl
    ```

1. 압축파일이 더 이상 필요없으니 삭제:

    ```bash
    rm -rf kubernetes kubernetes-server-linux-amd64.tar.gz
    ```

---

## Creating the Kube

### Set up kubelet

다음단계는 Kubelet 의 동작을 이해한다

1. 큐블릿을 위한 디렉토리를 만든다:

    ```bash
    mkdir -p /etc/kubernetes/manifests
    ```

1. 큐블릿을 백그라운드(데몬)로 실행한다:

    ```bash
    kubelet --pod-manifest-path /etc/kubernetes/manifests &> /etc/kubernetes/kubelet.log &
    ```

1. 큐블릿의 상태와 기본 로그를 확인한다:

    ```bash
    ps -au | grep kubelet
    head /etc/kubernetes/kubelet.log
    ```

1. 큐블릿의 manifest directory 에 yaml 을 위치하면, 큐블릿이 해당 yaml 을 도커엔진을 통해 컨테이너를 생성해주기 때문에 그를 테스트할 yaml 을 하나 만든다.

    ```bash
    cat <<EOF > /etc/kubernetes/manifests/kubelet-test.yaml
    ```

    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
    name: kubelet-test
    spec:
    containers:
    - name: alpine
        image: alpine
        command: ["/bin/sh", "-c"]
        args: ["while true; do echo SuPeRgIaNt; sleep 15; done"]
    ```

    ```bash
    EOF
    ```

1. 파일이 생성된 직후에 도커에 해당 pod 가 생성되었는지 확인한다.:

    ```bash
    docker ps
    ```

1. 컨테이너의 로그를 확인한다

    ```bash
    docker logs {CONTAINER ID}
    ```

### Set up etcd

이번단계는 etcd 에 쿠버네티스의 상태를 보존하는 것을 확인한다.

1. etcd 와 etcdctl를 다운받고 압축해제 한다:

    ```bash
    wget https://github.com/etcd-io/etcd/releases/download/v3.2.26/etcd-v3.2.26-linux-amd64.tar.gz
    tar -xzf etcd-v3.2.26-linux-amd64.tar.gz
    ```

1.  etcd 와 etcdctl 바이너리를 설치한다.

    ```bash
    mv etcd-v3.2.26-linux-amd64/etcd /usr/bin/etcd
    mv etcd-v3.2.26-linux-amd64/etcdctl /usr/bin/etcdctl
    ```

1. 불필요한 리소스를 삭제한다:

    ```bash
    rm -rf etcd-v3.2.26-linux-amd64 etcd-v3.2.26-linux-amd64.tar.gz
    ```

1. etcd를 실행한다:

    ```bash
    etcd --listen-client-urls http://0.0.0.0:2379 --advertise-client-urls http://localhost:2379 &> /etc/kubernetes/etcd.log &
    ```

1. etcd 가 건강하게 실행되고 있는지 다음과 같이 확인된다::

    ```bash
    etcdctl cluster-health
    ```

1. 쿠버네티스 내에 디플로이된 모든 리소스들을 한번 확인해본다:

    ```bash
    kubectl get all --all-namespaces
    ```

### Set up kube-apiserver

이번 단계는 apiserver 가 어떻게 실행되는지 이해합니다.

1.  kube-apiserver 를 실행한다

    ```bash
    kube-apiserver --etcd-servers=http://localhost:2379 --service-cluster-ip-range=10.0.0.0/16 --bind-address=0.0.0.0 --insecure-bind-address=0.0.0.0 &> /etc/kubernetes/apiserver.log &
    ```

1. 실행상태와 시작로그를 확인한다:

    ```bash
    ps -au | grep apiserver
    head /etc/kubernetes/apiserver.log
    ```

1. API 를 확인해보고 반응을 확인한다:

    ```bash
    curl http://localhost:8080/api/v1/nodes
    ```

## kubeconfig File 을 설정하여 kubectl 설정

이번 과정은 kubectl 을 제대로 설정해본다.

1. kubectl 이 API server 를 제대로 바라보고 있는지 확인한다

    ```bash
    kubectl cluster-info
    ```

1.  kubeconfig file에 API server address 가 잘 설정되었는지 확인한다

    ```bash
    kubectl config set-cluster kube-from-scratch --server=http://localhost:8080
    kubectl config view
    ```

1. 우리가 접속할 apiserver 로 kubectl 의 context 를 지정한다:

    ```bash
    kubectl config set-context kube-from-scratch --cluster=kube-from-scratch
    kubectl config view
    ```

1. Use the context created earlier for kubectl:

    ```bash
    kubectl config use-context kube-from-scratch
    kubectl config view
    ```

1. check that resources can now be seen on the cluster:

    ```bash
    kubectl get all --all-namespaces
    kubectl get node
    ```

### Set up the New Config for kubelet

The next steps will take the configuration created and use it to configure kubelet.

1. Restart kubelet with a new flag pointing it to the apiserver (this step may fail once or twice, try again):

    ```bash
    pkill -f kubelet
    kubelet --register-node --kubeconfig=".kube/config" &> /etc/kubernetes/kubelet.log &
    ```

1. Check its status and initial logs:

    ```bash
    ps -au | grep kubelet
    head /etc/kubernetes/kubelet.log
    ```
  
1. Check to see that kubelet has registered as a node:

    ```bash
    kubectl get node
    ```

1. Check to see the old Pod is not coming up:

    ```bash
    docker ps
    ```

1. Check that the Pod manifest is still present:

    ```bash
    ls /etc/kubernetes/manifests
    ```

1. 이제 kubelet 으로 pod 를 생성해봅니다. 우리가 설치한 control plane 들이 잘 동작하는지 확인하게 됩니다:

    ```bash
    cat <<EOF > ./kube-test.yaml
    ```

    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
    name: kube-test
    labels:
        app: kube-test
    spec:
    containers:
    - name: nginx
        image: nginx
        ports:
        - name:  http
        containerPort: 80
        protocol: TCP
    ```

    ```bash
    EOF
    kubectl create -f kube-test.yaml
    ```

1. Check the Pod's status:

    ```bash
    kubectl get po
    ```

### Set up kube-scheduler

다음 단계는 scheduler 를 통해서 pod 가 생성될 수 있도록 설정합니다

1. Scheduler를 시작합니다:

    ```bash
    kube-scheduler --master=http://localhost:8080/ &> /etc/kubernetes/scheduler.log &
    ```

1. 스케쥴러의 상태와 시작로그를 확인합니다:

    ```bash
    ps -au | grep scheduler
    head /etc/kubernetes/scheduler.log
    ```

1. Check to see if the Pod was scheduled:

    ```bash
    kubectl get po
    ```

1. Delete the Pod:

    ```bash
    kubectl delete po --all
    ```

### Set up kube-controller-manager

다음단계는 ReplicaSet 등을 관리해주는 다양한 쿠버네티스 객체의 행위를 지원하는 controller 매니저를 설치합니다.

1. 레플리카 3개가 설정된 Deployment를 준비한다:

    ```bash
    cat <<EOF > ./replica-test.yaml
    ```

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: replica-test
    spec:
    replicas: 3
    selector:
        matchLabels:
        app: replica-test
    template:
        metadata:
        name: replica-test
        labels:
            app: replica-test
        spec:
        containers:
        - name: nginx
            image: nginx
            ports:
            - name:  http
            containerPort: 80
            protocol: TCP
    ```

    ```bash
    EOF
    kubectl create -f replica-test.yaml
    ```

1. Check the Deployment's status:

    ```bash
    kubectl get deploy
    ```

1. `Pending` 상태임을 확인한다:

    ```bash
    kubectl get po
    ```

1. controller-manager를 시작한다:

    ```bash
    kube-controller-manager --master=http://localhost:8080 &> /etc/kubernetes/controller-manager.log &
    ```

1. Check its status and initial logs:

    ```bash
    ps -au | grep controller
    head /etc/kubernetes/controller-manager.log
    ```

1. Check the status of the Deployment:

    ```bash
    kubectl get deploy
    ```

1. 이제 3개의 Replica 가 생성되어 각 pod 의 상태가 `AVAILABLE` 로 변경된 것을 확인한다:

    ```bash
    kubectl rollout resume deploy/replica-test
    kubectl rollout status deploy/replica-test
    ```

1. Check the new Pods:

    ```bash
    kubectl get po
    ```

### Set up kube-proxy

이제 외부 트래픽을 Pod 로 전송하는 kube-proxy 를 설치하고 이들이 어떻게 동작하는지 이해한다:

1. 앞서의 `replica-test` Deployment에 대한 service 를 만들어준다:

    ```bash
    cat <<EOF > ./service-test.yaml
    ```

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
    name: replica-test
    spec:
    type: ClusterIP
    ports:
    - name: http
        port: 80
    selector:
        app: replica-test
    ```

    ```bash
        EOF
        kubectl create -f service-test.yaml
    ```

1. Curl the service to see if any Pod is contacted:

    ```bash
    kubectl get svc
    curl {CLUSTER IP}:80
    ```

1. Start kube-proxy:

    ```bash
    kube-proxy --master=http://localhost:8080/ &> /etc/kubernetes/proxy.log &
    ```

1. Check its status and initial logs:

    ```bash
    ps -au | grep proxy
    head /etc/kubernetes/proxy.log
    ```

1. Curl the Service again to see if any Pod is contacted:

    ```bash
    kubectl get svc
    curl {CLUSTER IP}:80
    ```


