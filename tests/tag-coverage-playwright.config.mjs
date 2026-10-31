import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'tag-coverage.spec.mjs',workers:1,timeout:20000,use:{headless:true},reporter:'list'});
