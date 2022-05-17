<template>
  <Layout>
      <div class="flex flex-wrap items-start justify-start">
        <div>
            <g-link
              to="http://www.msaez.io/"
              style="position:absolute; top:5px;"
              class="flex items-center px-1 py-1 ml-auto text-1xl font-bold leading-none text-white border rounded-lg shadow-lg bg-ui-primary border-ui-primary transition-all duration-200 ease-out transform hover:shadow-xl hover:-translate-y-1"
            >
              실습하기
              <ArrowRightCircleIcon class="ml-1" size="1x" />
            </g-link>
          </div>

        <!-- <div class="order-2 w-full md:w-1/3 sm:pl-4 md:pl-6 lg:pl-8 sticky" style="top: 4rem">
          <OnThisPage />
        </div> -->

        <div class="order-1 w-full">
          <div class="content" v-html="$page.markdownPage.content" style="min-width:1350px;"/>

          <div class="mt-8 pt-8 lg:mt-12 lg:pt-12 border-t border-ui-border">
            <NextPrevLinks />
          </div>
        </div>

      </div>
  </Layout>
</template>

<page-query>
query ($id: ID!) {
  markdownPage(id: $id) {
    id
    title
    description
    path
    timeToRead
    content
    sidebar
    next
    prev
    headings {
      depth
      value
      anchor
    }
  }
  allMarkdownPage{
    edges {
      node {
        path
        title
      }
    }
  }
}
</page-query>

<script>
// import OnThisPage from '@/components/OnThisPage.vue';
import NextPrevLinks from '@/components/NextPrevLinks.vue';
import { ArrowRightCircleIcon, ZapIcon, CodeIcon, MoonIcon, SearchIcon } from 'vue-feather-icons';


export default {
  components: {
    // OnThisPage,
    NextPrevLinks,
    ArrowRightCircleIcon
  },
  metaInfo: {
    title: 'msaez',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
  },
  
  watch: {
    "$page.markdownPage.content":function(newvalue){
      this.track()
    }
  },
  methods: {
    track() {

         var getTitle = this.$page.markdownPage && this.$page.markdownPage.title ?
             this.$page.markdownPage.title : this.$route.path
         var location = window.location.hostname
         if (location && location != 'localhost') {
             getTitle = `${location}_${getTitle}`
         }
         this.$ga.page({
             page: this.$route.path,
             title: getTitle
         })
    },
},



  metaInfo() {
    const title = this.$page.markdownPage.title;
    const description = this.$page.markdownPage.description || this.$page.markdownPage.excerpt;

    return {
      title: title,
      meta: [
        {
          name: 'description',
          content: description
        },
        {
          key: 'og:title',
          name: 'og:title',
          content: title,
        },
        {
          key: 'twitter:title',
          name: 'twitter:title',
          content: title,
        },
        {
          key: 'og:description',
          name: 'og:description',
          content: description,
        },
        {
          key: 'twitter:description',
          name: 'twitter:description',
          content: description,
        },
      ]
    }
  }
}
</script>

<style>
@import 'prism-themes/themes/prism-material-oceanic.css';
</style>