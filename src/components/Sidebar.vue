<template>
  <div
    ref="sidebar"
    v-if="showSidebar"
    class="pt-6 lg:pt-10"
  >
      <ClientOnly>
          <Search class="px-8 sidebar-search" style="margin-bottom:20px;"></Search>
      </ClientOnly>

    <div class="py-3 px-4 mb-4 border-ui-border"
      :class="{ 'border-b': index < sidebar.sections.length -1 }">
      <g-link
        to="http://www.msaschool.io/operation/introduction/"
        style="font-weight: 900; font-size: 17px;"
      >
      돌아가기
      </g-link>
    </div>
    <div
      v-for="(section, index) in sidebar.sections"
      :key="section.title"
      class="pb-4 px-4 mb-4 border-ui-border"
      :class="{ 'border-b': index < sidebar.sections.length -1 }"
    >
      <h3 style="font-weight:700" class="pt-0 mt-0 mb-1 text-lg tracking-tight uppercase border-none">
        {{ section.title }}
      </h3>

      <ul class="max-w-full px-2 mb-0">
        <li
          v-for="page in findPages(section.items)"
          :id="page.path"
          :key="page.path"
          :class="getClassesForAnchor(page)"
          @mousedown="$emit('navigate')"
        >
          <g-link
            :to="`${page.path}`"
            class="flex ml-4 items-center py-1 font-semibold"
          >
            {{ page.title }} 
          </g-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<static-query>
query Sidebar {
  metadata {
    settings {
      sidebar {
        name
        sections {
          title
          items
        }
      }
    }
  }
}
</static-query>

<script>
const Search = () => import(/* webpackChunkName: "search" */ "@/components/Search").catch(error => console.warn(error));

export default {
  components: {
    Search
  },
  data() {
    return {
      expanded: []
    };
  },
  computed: {
    pages() {
      return this.$page.allMarkdownPage.edges.map(edge => edge.node);
    },
    sidebar() {
      return this.$static.metadata.settings.sidebar.find(
        sidebar => sidebar.name === this.$page.markdownPage.sidebar
      );
    },
    showSidebar() {
      return this.$page.markdownPage.sidebar
        && this.sidebar;
    },
    currentPage() {
      return this.$page.markdownPage;
    }
  },
  methods: {
    getClassesForAnchor({ path }) {
      return {
        "text-ui-primary": this.currentPage.path === path,
        "transition transform hover:translate-x-1 hover:text-ui-primary": ! this.currentPage.path === path
      };
    },
    findPages(links) {
      return links.map(link => this.pages.find(page => page.path === link));
    }
  },  
};
</script>
<style>
  .sidebar-search {
    display: none;
  }
  @media only screen and (max-width:1025px) {
      .sidebar-search {
        display: block;
      }
  }
</style>