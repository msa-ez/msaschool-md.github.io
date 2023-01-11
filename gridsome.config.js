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
        { path: '/business/', title: 'Docs' }
      ]
    },
    sidebar: [
      {
        name: 'business',
        sections: [
          {
            title: 'Biz',
            items:[
              '/business/',
              '/business/ddd-google-drive/',
              '/business/eventstorming-fooddelivery/',
            ]
          },
          {
            title: 'Dev',
            items:[
              '/development/understanding-jpa-based-single-microservice/',
              '/development/cna-start/',
              '/development/monolith-2-misvc/',
              '/development/circuit-breaker/',
              '/development/kafka-basic/',
              '/development/pub-sub/',
              '/development/compensation-correlation/',
              '/development/pubsub-idempotency/',
              '/development/pubsub-deadline/',
              '/development/kafka-scaling/',
              '/development/kafka-retry-dlq/',
              '/development/kafka-connect/',
              '/development/gateway/',
              '/development/token-based-auth/',
              '/development/oauth2with-keycloak/',
              '/development/dp-frontend/',
              '/development/dp-graphql/',
              '/development/dp-cqrs/',
              '/development/ops-docker/',
              '/development/contract-test/',
            ]
          },
          {
            title: 'Ops',
            items:[
              '/operations/azure/',
              '/operations/ops-aws-setting/',
              '/operations/ops-kubernetes/',
              '/operations/ops-deploy-my-app/',
              '/operations/end-to-end/',
              '/operations/ops-pod-status/',
              '/operations/service/',
              '/operations/ops-liveness/',
              '/operations/ops-autoscale/',
              '/operations/ops-persistence-volume-efs/',
              '/operations/ops-persistence-volume/',
              '/operations/ops-readiness/',
              '/operations/ops-ingress/',
              '/operations/ops-ingress-virtualhost/',
              '/operations/ops-service-mesh-istio/',
              '/operations/ops-service-mesh-istio-2/',
              '/operations/istio-traffic/',
              '/operations/istio-resiliency-part1/',
              '/operations/istio-resiliency-part2/',
              '/operations/istio-metric-based-hpa/',
              '/operations/istio-msa-telemetry/',
              '/operations/k8s-monitoring/',
              '/operations/microservice-logging/',
              '/operations/apply-security-to-12st-mall/',
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
