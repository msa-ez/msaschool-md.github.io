const c1 = () => import(/* webpackChunkName: "page--src--templates--markdown-page-vue" */ "/Users/kevinkim/Desktop/msaschool-md.github.io/src/templates/MarkdownPage.vue")
const c2 = () => import(/* webpackChunkName: "page--src--pages--404-vue" */ "/Users/kevinkim/Desktop/msaschool-md.github.io/src/pages/404.vue")
const c3 = () => import(/* webpackChunkName: "page--src--pages--index-vue" */ "/Users/kevinkim/Desktop/msaschool-md.github.io/src/pages/Index.vue")

export default [
  {
    path: "/templates-language/springboot-java-template/",
    component: c1
  },
  {
    path: "/templates-language/python-template/",
    component: c1
  },
  {
    path: "/tool/infrastructure-modeling/",
    component: c1
  },
  {
    path: "/templates-language/go-template/",
    component: c1
  },
  {
    path: "/tool/event-storming-tool/",
    component: c1
  },
  {
    path: "/started/event-storming-learning/",
    component: c1
  },
  {
    path: "/templates-language/custom-template/",
    component: c1
  },
  {
    path: "/tool/cloud-ide-tool/",
    component: c1
  },
  {
    path: "/tool/development-practice/",
    component: c1
  },
  {
    path: "/custom-template/tutorial/",
    component: c1
  },
  {
    path: "/started/domain-driven/",
    component: c1
  },
  {
    path: "/example-scenario/online-lecture/",
    component: c1
  },
  {
    path: "/contact/question/",
    component: c1
  },
  {
    path: "/example-scenario/library-system/",
    component: c1
  },
  {
    path: "/example-scenario/food-delivery/",
    component: c1
  },
  {
    path: "/example-scenario/accommodation-reservation/",
    component: c1
  },
  {
    path: "/example-scenario/animal-hospital/",
    component: c1
  },
  {
    path: "/started/",
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
