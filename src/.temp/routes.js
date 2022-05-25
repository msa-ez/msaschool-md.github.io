const c1 = () => import(/* webpackChunkName: "page--src--templates--markdown-page-vue" */ "/Users/kevinkim/Desktop/vscode/msaschool-md.github.io/src/templates/MarkdownPage.vue")
const c2 = () => import(/* webpackChunkName: "page--src--pages--404-vue" */ "/Users/kevinkim/Desktop/vscode/msaschool-md.github.io/src/pages/404.vue")
const c3 = () => import(/* webpackChunkName: "page--src--pages--index-vue" */ "/Users/kevinkim/Desktop/vscode/msaschool-md.github.io/src/pages/Index.vue")

export default [
  {
    path: "/operations/ops-argo-rollout-canary-istio/",
    component: c1
  },
  {
    path: "/operations/ops-deploy-my-app/",
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
    path: "/business/zero-based-cna/",
    component: c1
  },
  {
    path: "/operations/msa-logging/",
    component: c1
  },
  {
    path: "/operations/k8s-monitoring/",
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
    path: "/development/ops-docker/",
    component: c1
  },
  {
    path: "/development/oauth2/",
    component: c1
  },
  {
    path: "/development/oauth2withkeycloak/",
    component: c1
  },
  {
    path: "/development/kafka-manual-commit/",
    component: c1
  },
  {
    path: "/development/kafka-retry-dlq/",
    component: c1
  },
  {
    path: "/development/keycloak-oauth2-1/",
    component: c1
  },
  {
    path: "/development/keycloak-oauth2-2/",
    component: c1
  },
  {
    path: "/development/keycloak-oauth2-3/",
    component: c1
  },
  {
    path: "/development/monolith2misvc/",
    component: c1
  },
  {
    path: "/development/kafka-base/",
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
    path: "/development/front-end/",
    component: c1
  },
  {
    path: "/development/gateway/",
    component: c1
  },
  {
    path: "/development/dp-composite-svc/",
    component: c1
  },
  {
    path: "/development/capstone-project-1/",
    component: c1
  },
  {
    path: "/development/capstone-project-2/",
    component: c1
  },
  {
    path: "/development/dp-cqrs/",
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
    path: "/business/design-to-code/",
    component: c1
  },
  {
    path: "/business/eventstorming-fooddelivery/",
    component: c1
  },
  {
    path: "/development/cna-pubsub/",
    component: c1
  },
  {
    path: "/development/cna-pubsub2/",
    component: c1
  },
  {
    path: "/development/cna-start/",
    component: c1
  },
  {
    path: "/development/contract-test/",
    component: c1
  },
  {
    path: "/development/cqrs-modeling/",
    component: c1
  },
  {
    path: "/development/circuitbreaker/",
    component: c1
  },
  {
    path: "/business/collaborative-eventstorming/",
    component: c1
  },
  {
    path: "/development/advanced-connect/",
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
