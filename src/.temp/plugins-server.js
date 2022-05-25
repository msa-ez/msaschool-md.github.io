import plugin_gridsome_plugin_tailwindcss_6 from "/Users/kevinkim/Desktop/vscode/msaschool-md.github.io/node_modules/gridsome-plugin-tailwindcss/gridsome.client.js"
import plugin_gridsome_plugin_google_analytics_7 from "/Users/kevinkim/Desktop/vscode/msaschool-md.github.io/node_modules/@gridsome/plugin-google-analytics/gridsome.client.js"
import plugin_project_9 from "/Users/kevinkim/Desktop/vscode/msaschool-md.github.io/gridsome.client.js"

export default [
  {
    run: plugin_gridsome_plugin_tailwindcss_6,
    options: {"tailwindConfig":"./tailwind.config.js","purgeConfig":{"whitelistPatternsChildren":[{}],"keyframes":true,"content":["./src/**/*.vue","./src/**/*.js","./src/**/*.jsx","./src/**/*.ts","./src/**/*.tsx","./src/**/*.html","./src/**/*.pug","./src/**/*.md","./src/**/*.svg"],"whitelist":["body","html","img","a","g-image","g-image--lazy","g-image--loaded","active","active--exact"],"whitelistPatterns":[{},{},{},{},{},{},{},{},{},{}]},"shouldPurge":true,"shouldImport":true,"shouldTimeTravel":true,"importUrlConfig":{"modernBrowser":true},"presetEnvConfig":{"stage":0,"autoprefixer":false,"features":{"focus-visible-pseudo-class":false,"focus-within-pseudo-class":false}}}
  },
  {
    run: plugin_gridsome_plugin_google_analytics_7,
    options: {"id":"UA-153107610-3"}
  },
  {
    run: plugin_project_9,
    options: {}
  }
]
