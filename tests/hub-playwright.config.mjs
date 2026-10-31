import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'hub-browser.spec.mjs',timeout:30000,workers:1,use:{headless:true},reporter:'list'});
