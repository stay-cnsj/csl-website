<script setup lang="ts">
import { site } from "~/data/site";
const copyrightYear = useState("copyright-year", () =>
  new Date().getFullYear(),
);
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner container-fluid">
      <div class="row gx-lg-5 gy-4">
        <div class="col-md-7 footer-identity">
          <NuxtLink class="footer-title" to="/">{{ site.name }}</NuxtLink>
          <p class="footer-english" lang="en">{{ site.englishName }}</p>
          <p class="footer-description">
            融合认知科学与数据科学<br />探索大模型与智能体的认知能力
          </p>
          <p class="footer-lab">
            拟设计算机科学实验室 · CSL<br />实验室负责人：{{
              site.principalInvestigator
            }}
          </p>
        </div>
        <div class="col-md-5">
          <nav class="footer-links" aria-label="页脚导航">
            <ul>
              <li><NuxtLink to="/research/">研究方向</NuxtLink></li>
              <li><NuxtLink to="/framework/">研究方向架构</NuxtLink></li>
              <li>
                <NuxtLink to="/research/#applications">交叉研究与应用</NuxtLink>
              </li>
              <li><NuxtLink to="/about/">关于计算机科学实验室</NuxtLink></li>
            </ul>
          </nav>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ copyrightYear }} CSL</span
        ><NuxtLink to="/editor/">论文编辑</NuxtLink
        ><span>认知大模型与数据智能</span>
      </div>
    </div>
  </footer>
</template>
