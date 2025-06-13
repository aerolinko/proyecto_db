import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from "@/components/HelloWorld.vue";
import test from "@/components/test.vue";

const routes = [
    {
        path: '/',
        name: 'AddSale',
        component: HelloWorld
    },
    {
        path: '/test',
        name: 'AddTest',
        component: test
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;