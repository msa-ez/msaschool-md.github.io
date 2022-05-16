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
  siteUrl: (process.env.SITE_URL ? process.env.SITE_URL : 'https://intro-kor.msaez.io'),
  settings: {
    web: process.env.URL_WEB || false,
    twitter: process.env.URL_TWITTER || false,
    github: process.env.URL_GITHUB || false,
    nav: {
      links: [
        { path: '/started/', title: 'Docs' }
      ]
    },
    sidebar: [
      {
        name: 'started',
        sections: [
          {
            title: '시작하기',
            items: [
              '/started/',
              '/started/domain-driven/',
              '/started/event-storming-learning/',
            ]
          },
          {
            title: '도구 사용법',
            items: [
              '/tool/event-storming-tool/',
              '/tool/cloud-ide-tool/',
              '/tool/infrastructure-modeling/',
              '/tool/development-practice/'
            ]
          },
          {
            title: '언어별 템플릿',
            items: [
              '/templates-language/python-template/',
              '/templates-language/springboot-java-template/',
              '/templates-language/custom-template/',
              '/templates-language/go-template/',
            ]
          },
          {
            title: '커스텀 템플릿',
            items:[
              '/custom-template/tutorial/',
            ]
          },
          {
            title: '예제 시나리오',
            items: [
              '/example-scenario/accommodation-reservation/',
              '/example-scenario/food-delivery/',
              '/example-scenario/library-system/',
              '/example-scenario/animal-hospital/',
              '/example-scenario/online-lecture/',
            ]
          },
          {
            title: '문의사항',
            items: [
              '/contact/question/'
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
