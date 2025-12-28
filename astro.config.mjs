import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  server: {
    port: 10001
  },
  i18n: {
    defaultLocale: 'zh-tw',
    locales: ['en', 'zh-tw', 'zh-cn', 'ja'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
