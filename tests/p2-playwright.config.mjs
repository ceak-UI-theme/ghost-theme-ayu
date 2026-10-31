import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'p2-regression.spec.mjs',timeout:20000,workers:1,use:{headless:true,viewport:{width:390,height:844}},reporter:'list'});
