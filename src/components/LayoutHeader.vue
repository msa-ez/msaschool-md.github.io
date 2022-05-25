<template>
    <!--    <div class="py-2 border-t-2 border-ui-primary" style="background-color: #1e88e5;">-->
    <div class="py-2 border-t-2 border-ui-primary">
        <!--        <div class="container">-->
        <div>

            <div class="flex item-center" style="justify-content:space-between;">

                <!-- 사이드바 버튼 -->
                <!--                <div style="max-width: 3%; z-index: 999;" >-->
                <!--                    <button class="p-3 text-black rounded-full "-->
                <!--                            @click="sidebarClicked()">-->
                <!--                        <MenuIcon size="20" />-->
                <!--                    </button>-->
                <!--                </div>-->


                <div class="flex flex-col items-center sm:flex-row" style="margin-left:5%; place-self:center; width:1100px;">
                    <!--                <div class="flex flex-col items-center px-3  mr-auto  sm:flex-row" style="margin-left:5%;">-->
                    <g-link
                            to="http://www.msaschool.io/operation/introduction/"
                            title="Home"
                            style="margin-right: 30px;"
                    >
                        <HomeLogo/>
                    </g-link>
                    <ClientOnly>
                        <Search class="small-view-search"></Search>
                    </ClientOnly>

                </div>

                <div class="flex flex-col items-center px-3   mr-auto  sm:flex-row"
                     style="justify-content:flex-end; margin-right:1.5%;">
                    <!-- <div class="modal-container">
                        <input id="modal-toggle" type="checkbox">
                        <label class="modal-btn"
                            for="modal-toggle" 
                            style="display: block;
                                width:120px;
                                height:36px;
                                line-height: 36px;
                                margin: 0 auto;
                                font-weight: 500;
                                font-size:24px;
                                color: #fff;
                                background: #5a67d8;
                                font-size: 14px;
                                border: 0;
                                border-radius: 4px;
                                cursor: pointer;
                                text-align: center;
                                box-shadow: 0 5px 5px -5px #333;
                                transition: background 0.3s ease-in;" 
                            >커리큘럼 보기</label> 
                        <label class="modal-backdrop" for="modal-toggle"></label>
                        <div class="modal-content">
                            <label class="modal-close" for="modal-toggle">&#x2715;</label>
                            <h2>Cloud Native Modeling & Application 구현과정 교안</h2><hr />
                            <g-image class="g-images" src="~/img/05_Community/04_교육상담_및_신청/image7.png"></g-image>
                            <g-image class="g-images" src="~/img/05_Community/04_교육상담_및_신청/image8.png"></g-image>
                            <g-image class="g-images" src="~/img/05_Community/04_교육상담_및_신청/image9.png"></g-image>
                            <g-image class="g-images" src="~/img/05_Community/04_교육상담_및_신청/image10.png"></g-image>
                        </div>
                    </div>  -->
                    <v-btn style="background-color:#5a67d8 !important;
                        border-radius: 4px;
                        margin-left:-10px;
                        height: 36px;
                        width: 120px;
                        text-align: center;
                        line-height: 36px;
                        font-size: 14px;
                        font-weight: 700;"
                    ><span ><g-link style="color:white;" to="http://www.msaschool.io/operation/education/schedule/">실 습 하 기</g-link></span>
                    </v-btn>
                </div>

            </div>
        </div>
    </div>
</template>

<static-query>
query {
  metadata {
    siteName
    settings {
      web
      github
      twitter
      nav {
        links {
          path
          title
        }
      }
    }
  }
}
</static-query>

<script>
import HomeLogo from '@/components/HomeLogo';
import { SunIcon, MoonIcon, GlobeIcon, GithubIcon, TwitterIcon } from "vue-feather-icons";

const Search = () => import(/* webpackChunkName: "search" */ "@/components/Search").catch(error => console.warn(error));

export default {
  components: {
    HomeLogo,
    Search,
    SunIcon,
    MoonIcon,
    GlobeIcon,
    GithubIcon,
    TwitterIcon
  },
  meta() {
    return this.$static.metadata;
  },
  settings() {
    return this.meta.settings;
  }
};
</script>

<style lang="scss">
header {
  svg:not(.feather-search) {
    &:hover {
      @apply text-ui-primary;
    }
  }
}

.nav-link {
  &.active {
    @apply text-ui-primary font-bold border-ui-primary;
  }
}
</style>
<style>
  .small-view-search {
    display: block;
  }
  @media only screen and (max-width:1025px) {
      .small-view-search {
        display: none;
      }
  }
</style>