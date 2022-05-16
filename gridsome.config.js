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
            ]
          },
          //     '/introduction/example-application/',
          //     '/introduction/related-resource/',
          //     '/introduction/util-and-tool/',
          //   ]
          // {
          //   title: '계획',
          //   items: [
          //     '/planning/step-by-step-goal/',
          //     '/planning/segmentation-level/',
          //     '/planning/avatar-pattern/',
          //     '/planning/planning/',
          //     '/planning/system-security/',
          //     '/planning/performance-measures/',
          //     '/planning/test-measures/',
          //   ]
          // },
          // {
          //   title: '분석',
          //   items: [
          //     '/analysis/analysis-one/',
          //     '/analysis/analysis-two/',
          //     '/analysis/analysis-three/',
          //   ]
          // },
          // {
          //   title: '설계',
          //   items:[
          //     '/design/design-one/',
          //     '/design/design-two/',
          //     '/design/design-three/',
          //     '/design/design-four/',
          //     '/design/design-five/',
          //     '/design/design-six/',
          //     '/design/design-seven/',
          //     '/design/design-eight/',
          //   ]
          // },
          // {
          //   title: '구현',
          //   items: [
          //     '/implementation/implementation-one/',
          //     '/implementation/implementation-two/',
          //     '/implementation/implementation-three/',
          //     '/implementation/implementation-four/',
          //     '/implementation/implementation-five/',
          //     '/implementation/implementation-six/',
          //     '/implementation/implementation-seven/',
          //   ]
          // },
          // {
          //   title: '통합',
          //   items: [
          //     '/integration/integration-one/',
          //     '/integration/integration-two/',
          //     '/integration/integration-three/',
          //     '/integration/integration-four/',
          //     '/integration/integration-five/',
          //     '/integration/integration-six/',
          //   ]
          // },
          // {
          //   title: '배포',
          //   items: [
          //     '/deployment/deployment-one/',
          //     '/deployment/deployment-two/',
          //     '/deployment/deployment-three/',
          //     '/deployment/deployment-four/',
          //   ]
          // },
          // {
          //   title: '운영',
          //   items: [
          //     '/operation/operation-one/',
          //     '/operation/operation-two/',
          //     '/operation/operation-three/',
          //     '/operation/operation-four/',
          //     '/operation/operation-five/',
          //     '/operation/operation-six/',
          //     '/operation/operation-seven/',
          //   ]
          // },
          // {
          //   title: '트러블 슈팅',
          //   items: [
          //     '/checkpoint/checkpoint-one/',
          //     '/checkpoint/checkpoint-two/',
          //   ]
          // },
          // {
          //   title: 'MSA 전환전략',
          //   items: [
          //     '/strategy/strategy-one/',
          //     '/strategy/strategy-two/',
          //     '/strategy/strategy-three/',
          //   ]
          // },
          // {
          //   title: 'MSA 도구',
          //   items: [
          //     '/tool/tool-one/',
          //     '/tool/tool-two/',
          //     '/tool/tool-three/',
          //   ]
          // },
          // {
          //   title: 'MSA OUTER 아키텍처',
          //   items: [
          //     '/architecture/architecture-one/',
          //     '/architecture/architecture-two/',
          //     '/architecture/architecture-three/',
          //     '/architecture/architecture-four/',
          //     '/architecture/architecture-five/',
          //   ]
          // },
          // {
          //   title: '교육 및 커뮤니티',
          //   items: [
          //     '/education/quick-understanding-cna/',
          //     '/education/standard-cna/',
          //     '/education/flipped-learning-cna/',
          //     '/education/one-point-lesson/',
          //     '/education/enterprise-full-day/',
          //     '/education/community/',
          //   ]
          // },
          // {
          //   title: 'BUSINESS',
          //   items: [
          //     '/biz/design-event/',
          //     '/biz/eventstorming-food-delivery/',
          //     '/biz/ddd-google-drive/',
          //     '/biz/collaborative-eventstorming/',
          //     '/biz/design-to-code/',
          //     '/biz/zero-based-cna/',
          //   ]
          // },
          // {
          //   title: 'DEVELOPMENT',
          //   items: [
          //     '/dev/cna-start/',
          //     '/dev/gateway/',
          //     '/dev/oauth2/',
          //     '/dev/oauth2-with-keycloak/',
          //     '/dev/keycloak-oauth2-1/',
          //     '/dev/keycloak-oauth2-2/',
          //     '/dev/keycloak-oauth2-3/',
          //     '/dev/front-end/',
          //     '/dev/monolith2-misvc/',
          //     '/dev/circuit-breaker/',
          //     '/dev/kafka-base/',
          //     '/dev/cna-pubsub-one/',
          //     '/dev/cna-pubsub-two/',
          //     '/dev/kafka-scaling/',
          //     '/dev/kafka-manual-commit/',
          //     '/dev/kafka-retry-dlq/',
          //     '/dev/advanced-connect/',
          //     '/dev/dp-composite-svc/',
          //     '/dev/dp-graphql/',
          //     '/dev/cqrs-modeling/',
          //     '/dev/dp-cqrs/',
          //     '/dev/contract-test/',
          //     '/dev/ops-docker/',
          //     '/dev/capstone-project-one/',
          //     '/dev/capstone-project-two/',
          //   ]
          // },
          // {
          //   title: 'OPERATION',
          //   items: [
          //     '/ops/azure/',
          //     '/ops/ops-aws-setting/',
          //     '/ops/ops-kubernetes/',
          //     '/ops/ops-deploy-my-app/',
          //     '/ops/end-to-end/',
          //     '/ops/ops-readiness/',
          //     '/ops/ops-liveness/',
          //     '/ops/ops-auto-scale/',
          //     '/ops/ops-persistence-volume/',
          //     '/ops/ops-ingress/',
          //     '/ops/ops-ingress-virtual-host/',
          //     '/ops/ops-service-mesh-istio/',
          //     '/ops/istio-traffic/',
          //     '/ops/istio-resiliency-part-one/',
          //     '/ops/istio-resiliency-part-two/',
          //     '/ops/istio-msa-telemetry/',
          //     '/ops/k8s-monitoring/',
          //     '/ops/msa-logging/',
          //     '/ops/ops-argo-rollout-canary-istio/',
          //     '/ops/gitops-argo-cd/',
          //     '/ops/ops-anatomy-kubernetes/',
          //     '/ops/ops-utility/',
          //   ]
          // },
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
