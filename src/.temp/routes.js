const c1 = () => import(/* webpackChunkName: "page--src--templates--markdown-page-vue" */ "/Users/dufwjdrndl/Desktop/uengine/msaschool-md.github.io/src/templates/MarkdownPage.vue")
const c2 = () => import(/* webpackChunkName: "page--src--pages--404-vue" */ "/Users/dufwjdrndl/Desktop/uengine/msaschool-md.github.io/src/pages/404.vue")
const c3 = () => import(/* webpackChunkName: "page--src--pages--index-vue" */ "/Users/dufwjdrndl/Desktop/uengine/msaschool-md.github.io/src/pages/Index.vue")

export default [
  {
    path: "/operations/ops-argo-rollout-canary-istio/",
    component: c1
  },
  {
    path: "/operations/ops-service-mesh-istio-2/",
    component: c1
  },
  {
    path: "/operations/service/",
    component: c1
  },
  {
    path: "/operations/ops-deploy-my-app/",
    component: c1
  },
  {
    path: "/operations/ops-persistence-volume-efs/",
    component: c1
  },
  {
    path: "/operations/ops-service-mesh-istio/",
    component: c1
  },
  {
    path: "/operations/ops-anatomy-kubernetes/",
    component: c1
  },
  {
    path: "/operations/ops-aws-setting/",
    component: c1
  },
  {
    path: "/operations/ops-ingress-virtualhost/",
    component: c1
  },
  {
    path: "/operations/ops-persistence-volume/",
    component: c1
  },
  {
    path: "/operations/ops-pod-status/",
    component: c1
  },
  {
    path: "/operations/ops-autoscale/",
    component: c1
  },
  {
    path: "/operations/ops-ingress/",
    component: c1
  },
  {
    path: "/operations/ops-kubernetes/",
    component: c1
  },
  {
    path: "/operations/ops-liveness/",
    component: c1
  },
  {
    path: "/operations/ops-readiness/",
    component: c1
  },
  {
    path: "/operations/ops-utility/",
    component: c1
  },
  {
    path: "/development/understanding-jpa-based-single-microservice/",
    component: c1
  },
  {
    path: "/operations/microservice-logging/",
    component: c1
  },
  {
    path: "/operations/istio-metric-based-hpa/",
    component: c1
  },
  {
    path: "/operations/k8s-monitoring/",
    component: c1
  },
  {
    path: "/development/token-based-auth/",
    component: c1
  },
  {
    path: "/operations/istio-msa-telemetry/",
    component: c1
  },
  {
    path: "/operations/istio-resiliency-part1/",
    component: c1
  },
  {
    path: "/operations/istio-resiliency-part2/",
    component: c1
  },
  {
    path: "/operations/istio-traffic/",
    component: c1
  },
  {
    path: "/operations/gitops-argo-cd/",
    component: c1
  },
  {
    path: "/operations/end-to-end/",
    component: c1
  },
  {
    path: "/development/pub-sub/",
    component: c1
  },
  {
    path: "/development/pubsub-deadline/",
    component: c1
  },
  {
    path: "/development/pubsub-idempotency/",
    component: c1
  },
  {
    path: "/development/oauth2with-keycloak/",
    component: c1
  },
  {
    path: "/development/ops-docker/",
    component: c1
  },
  {
    path: "/operations/apply-security-to-12st-mall/",
    component: c1
  },
  {
    path: "/development/monolith-2-misvc/",
    component: c1
  },
  {
    path: "/development/kafka-retry-dlq/",
    component: c1
  },
  {
    path: "/development/kafka-basic/",
    component: c1
  },
  {
    path: "/development/kafka-connect/",
    component: c1
  },
  {
    path: "/development/kafka-scaling/",
    component: c1
  },
  {
    path: "/operations/azure/",
    component: c1
  },
  {
    path: "/development/gateway/",
    component: c1
  },
  {
    path: "/development/dp-cqrs/",
    component: c1
  },
  {
    path: "/development/dp-frontend/",
    component: c1
  },
  {
    path: "/development/dp-graphql/",
    component: c1
  },
  {
    path: "/business/ddd-google-drive/",
    component: c1
  },
  {
    path: "/business/eventstorming-fooddelivery/",
    component: c1
  },
  {
    path: "/development/circuit-breaker/",
    component: c1
  },
  {
    path: "/development/cna-start/",
    component: c1
  },
  {
    path: "/development/compensation-correlation/",
    component: c1
  },
  {
    path: "/development/contract-test/",
    component: c1
  },
  {
    path: "/business/",
    component: c1
  },
  {
    name: "404",
    path: "/404/",
    component: c2
  },
  {
    name: "home",
    path: "/",
    component: c3
  },
  {
    name: "*",
    path: "*",
    component: c2
  }
]
