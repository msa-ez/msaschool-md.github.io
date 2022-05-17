// This is where project configuration and plugin options are located. 
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'msaez',
  icon: {
    favicon: './src/assets/favicon.png',
    touchicon: './src/assets/favicon.png'
  },
  siteUrl: (process.env.SITE_URL ? process.env.SITE_URL : 'https://msaschool-md.github.io'),
  settings: {
    web: process.env.URL_WEB || false,
    twitter: process.env.URL_TWITTER || false,
    github: process.env.URL_GITHUB || false,
    nav: {
      links: [
        { path: '/introduction/', title: 'Docs' }
      ]
    },
    sidebar: [
      {
        name: 'introduction',
        sections: [
          {
            title: '소개',
            items: [
              '/introduction/',
              '/introduction/used-platform/',
              '/introduction/example-application/',
              '/introduction/related-resource/',
              '/introduction/util-and-tool/',
            ]
          },
          {
            title: '계획',
            items: [
              '/planning/step-by-step-goal/',
              '/planning/segmentation-level/',
              '/planning/avatar-pattern/',
              '/planning/planning/',
              '/planning/system-security/',
              '/planning/performance-measures/',
              '/planning/test-measures/',
            ]
          },
          {
            title: '분석',
            items: [
              '/analysis/analysis-one/',
              '/analysis/analysis-two/',
              '/analysis/analysis-three/',
            ]
          },
          {
            title: '설계',
            items:[
              '/design/design-one/',
              '/design/design-two/',
              '/design/design-three/',
              '/design/design-four/',
              '/design/design-five/',
              '/design/design-six/',
              '/design/design-seven/',
              '/design/design-eight/',
            ]
          },
          {
            title: '구현',
            items: [
              '/implementation/implementation-one/',
              '/implementation/implementation-two/',
              '/implementation/implementation-three/',
              '/implementation/implementation-four/',
              '/implementation/implementation-five/',
              '/implementation/implementation-six/',
              '/implementation/implementation-seven/',
            ]
          },
          {
            title: '통합',
            items: [
              '/integration/integration-one/',
              '/integration/integration-two/',
              '/integration/integration-three/',
              '/integration/integration-four/',
              '/integration/integration-five/',
              '/integration/integration-six/',
            ]
          },
          {
            title: '배포',
            items: [
              '/deployment/deployment-one/',
              '/deployment/deployment-two/',
              '/deployment/deployment-three/',
              '/deployment/deployment-four/',
            ]
          },
          {
            title: '운영',
            items: [
              '/operation/operation-one/',
              '/operation/operation-two/',
              '/operation/operation-three/',
              '/operation/operation-four/',
              '/operation/operation-five/',
              '/operation/operation-six/',
              '/operation/operation-seven/',
            ]
          },
          {
            title: '트러블 슈팅',
            items: [
              '/checkpoint/checkpoint-one/',
              '/checkpoint/checkpoint-two/',
            ]
          },
          {
            title: 'MSA 전환전략',
            items: [
              '/strategy/strategy-one/',
              '/strategy/strategy-two/',
              '/strategy/strategy-three/',
            ]
          },
          {
            title: 'MSA 도구',
            items: [
              '/tool/tool-one/',
              '/tool/tool-two/',
              '/tool/tool-three/',
            ]
          },
          {
            title: 'MSA OUTER 아키텍처',
            items: [
              '/architecture/architecture-one/',
              '/architecture/architecture-two/',
              '/architecture/architecture-three/',
              '/architecture/architecture-four/',
              '/architecture/architecture-five/',
            ]
          },
          {
            title: '교육 및 커뮤니티',
            items: [
              '/education/quick-understanding-cna/',
              '/education/standard-cna/',
              '/education/flipped-learning-cna/',
              '/education/one-point-lesson/',
              '/education/enterprise-full-day/',
              '/education/community/',
            ]
          },
          {
            title: 'Business',
            items:[
              '/business/design-event/',
              '/business/eventstorming-fooddelivery/',
              '/business/ddd-google-drive/',
              '/business/collaborative-eventstorming/',
              '/business/design-to-code/',
              '/business/zero-based-cna/',
            ]
          },
          {
            title: 'Development',
            items:[
              '/development/cna-start/',
              '/development/gateway/',
              '/development/oauth2/',
              '/development/oauth2withkeycloak/',
              '/development/keycloak-oauth2-1/',
              '/development/keycloak-oauth2-2/',
              '/development/keycloak-oauth2-3/',
              '/development/front-end/',
              '/development/monolith2misvc/',
              '/development/circuitbreaker/',
              '/development/kafka-base/',
              '/development/cna-pubsub/',
              '/development/cna-pubsub2/',
              '/development/kafka-scaling/',
              '/development/kafka-manual-commit/',
              '/development/kafka-retry-dlq/',
              '/development/advanced-connect/',
              '/development/dp-composite-svc/',
              '/development/dp-graphql/',
              '/development/cqrs-modeling/',
              '/development/dp-cqrs/',
              '/development/contract-test/',
              '/development/ops-docker/',
              '/development/capstone-project-1/',
              '/development/capstone-project-2/',
            ]
          },
          {
            title: 'Operations',
            items:[
              '/operations/azure/',
              '/operations/ops-aws-setting/',
              '/operations/ops-kubernetes/',
              '/operations/ops-deploy-my-app/',
              '/operations/end-to-end/',
              '/operations/ops-readiness/',
              '/operations/ops-liveness/',
              '/operations/ops-autoscale/',
              '/operations/ops-persistence-volume/',
              '/operations/ops-ingress/',
              '/operations/ops-ingress-virtualhost/',
              '/operations/ops-service-mesh-istio/',
              '/operations/istio-traffic/',
              '/operations/istio-resiliency-part1/',
              '/operations/istio-resiliency-part2/',
              '/operations/istio-msa-telemetry/',
              '/operations/k8s-monitoring/',
              '/operations/msa-logging/',
              '/operations/ops-argo-rollout-canary-istio/',
              '/operations/gitops-argo-cd/',
              '/operations/ops-anatomy-kubernetes/',
              '/operations/ops-utility/',
            ]
          },
        ]
      }
    ]
  },
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        baseDir: './content',
        path: '**/*.md',
        typeName: 'MarkdownPage',
        remark: {
          externalLinksTarget: '_blank',
          externalLinksRel: ['noopener', 'noreferrer'],
          plugins: [
            '@gridsome/remark-prismjs'
          ]
        }
      }
    },

    {
      use: 'gridsome-plugin-tailwindcss',
      options: {
        tailwindConfig: './tailwind.config.js',
        purgeConfig: {
          // Prevent purging of prism classes.
          whitelistPatternsChildren: [
            /token$/
          ]
        }
      }
    },

    {
      use: '@gridsome/plugin-google-analytics',
      options: {
        id: 'UA-153107610-3'
      }
    },

    {
      use: '@gridsome/plugin-sitemap',
      options: {  
      }
    }

  ]
}
