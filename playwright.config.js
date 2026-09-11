import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:120000,expect:{timeout:6000},use:{baseURL:'http://127.0.0.1:4173',...devices['iPhone 13'],trace:'retain-on-failure'},projects:[{name:'webkit',use:{browserName:'webkit'}}]});
