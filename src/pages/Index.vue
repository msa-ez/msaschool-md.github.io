<template>
  <div>
    <Layout>
      <div class="pt-8 md:pt-16">
        <div class="flex flex-col items-center">
          <div class="flex flex-col items-center mb-2 text-ui-primary">
            <h2 class="text-3xl text-6xl font-black tracking-tighter border-none">
              MSA Easy
            </h2>
          </div>
          <h1 class=" text-center">
            The fastest way to build event-driven microservices
          </h1>

          <div class="flex justify-center mt-8">
            <g-link
              to="/business/"
              class="flex items-center px-6 py-4 ml-auto text-2xl font-bold leading-none text-white border rounded-lg shadow-lg bg-ui-primary border-ui-primary transition-all duration-200 ease-out transform hover:shadow-xl hover:-translate-y-1"
            >
              Get started
              <ArrowRightCircleIcon class="ml-4" size="1x" />
            </g-link>
          </div>
        </div>

        <div class=" mx-auto mt-8 md:mt-16 max-w-screen-sm"></div>

        <div class="flex flex-wrap justify-center -mx-4">
          <div class="flex flex-col items-center w-full px-4 mb-8 text-center md:w-1/3">
            <h3 class="font-bold tracking-wide uppercase text-ui-primary">
              Collective EventStorming
            </h3>
            <g-image style = "width:100%;" src="~/img/img_1.png"  />
            <p class="text-lg text-left">
              <br>
              MSA Easy는 마이크로서비스 구축에서 운영에 필요한 분석, 설계, 구현 및 모니터링을 지원하는 도구로써,
              이벤트스토밍 기반 협업을 통해 도메인을 분석/설계하고, 설계된 도메인 모델에서 MSA 소스코드를 자동으로 생성해 줍니다.
              분석/ 설계단계에서는 MSA Easy를 사용해 대상 도메인의 경계를 식별하고 Contract(계약)을 정의합니다.
            </p>
          </div>

          <div class="flex flex-col items-center w-full px-4 mb-8 text-center md:w-1/3">
            
            <h3 class="font-bold tracking-wide uppercase text-ui-primary">
              Model 2 Code 2 Cloud
            </h3>
            <g-image style = "width:100%;" src="~/img/img_2.png"  />
            <p class="text-lg text-left">
              <br>
              설계된 모델은 MDD(Model-driven Design) 패턴에 따라 MSA 코드로 변환됩니다.
              MSA 코드이외에 컨트랙트 테스트 Code,
              도커 이미지 생성 스크립트 및 클라우드(GCP, AWS, Azure 등)에 즉시 배포 가능한 CI/CD 파이프라인 스크립트를 자동 생성해 줍니다.
            </p>
          </div>

          <div class="flex flex-col items-center w-full px-4 mb-8 text-center md:w-1/3">
            <h3 class="font-bold tracking-wide uppercase text-ui-primary">
              Polyglot & Custom Template
            </h3>
            <g-image style = "width:100%;" src="~/img/img_3.png"  />
            <p class="text-lg text-left">
              <br>
              MSA의 최대 장점 중 하나는 서비스별 최적의 기술 적용이 가능한 폴리글랏 아키텍처입니다.
              ES2CD는 이벤트스토밍 결과, 식별된 마이크로서비스별 코드 생성이 가능하며,
              ‘사용자 정의 템플릿’을 통해, 다양한 언어 및 정보공학 노테이션(Notation)으로의 확장을 지원합니다.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  </div>
</template>

<script>
import Logo from '@/components/Logo';
import { ArrowRightCircleIcon, ZapIcon, CodeIcon, MoonIcon, SearchIcon } from 'vue-feather-icons';
import Footer from '@/components/Footer';

export default {
  components: {
    Logo,
    ArrowRightCircleIcon,
    ZapIcon,
    CodeIcon,
    MoonIcon,
    SearchIcon,
    Footer
  },

  metaInfo() {
    const title = '이벤트 스토밍';
    const description = 'intromsaez,이벤트 스토밍,EventStorming,msaeasy,MSA설계,교육,MSA강의,MSA교육,CNA,마이크로서비스,스프링부트,SpringBoot,이벤트 스토밍 강의,이벤트 스토밍 교육,쿠버네티스,컨테이너,이벤트 스토밍 설계,마이크로서비스 교육,쿠버네티스 강의,쿠버네티스 교육,스프링부트 강의,스프링부트 교육,CNA강의,CNA 강의,CNA교육,CNA 교육,객체지향 강의,객체지향 교육,CNA 구현,CNA구현,kubernetes,kubernetes 강의,kubernetes 교육';
    

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
        {
          key: 'keywords',
          name: 'keywords',
          content: 'intromsaez,이벤트 스토밍,EventStorming,msaeasy,MSA설계,교육,MSA강의,MSA교육,CNA,마이크로서비스,스프링부트,SpringBoot,이벤트 스토밍 강의,이벤트 스토밍 교육,쿠버네티스,컨테이너,이벤트 스토밍 설계,마이크로서비스 교육,쿠버네티스 강의,쿠버네티스 교육,스프링부트 강의,스프링부트 교육,CNA강의,CNA 강의,CNA교육,CNA 교육,객체지향 강의,객체지향 교육,CNA 구현,CNA구현,kubernetes,kubernetes 강의,kubernetes 교육'
        },
      ]
    }
  }
}
</script>

<style>
.home-links a {
  margin-right: 1rem;
}
</style>
