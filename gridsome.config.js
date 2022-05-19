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
  siteUrl: (process.env.SITE_URL ? process.env.SITE_URL : 'msaschool-md.github.io'),
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
              '/business/eventstorming-fooddelivery/',
              '/business/ddd-google-drive/',
              '/business/collaborative-eventstorming/',
              '/business/design-to-code/',
              '/business/zero-based-cna/',
            ]
          },
          {
            title: 'Dev',
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
            title: 'Ops',
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
