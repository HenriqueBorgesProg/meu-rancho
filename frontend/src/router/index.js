import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
    },
    {
      path: "/animais",
      name: "animals-list",
      component: () => import("../views/AnimalsListView.vue"),
    },
    {
      path: "/animais/novo",
      name: "animal-create",
      component: () => import("../views/AnimalFormView.vue"),
    },
    {
      path: "/animais/:id",
      name: "animal-detail",
      component: () => import("../views/AnimalDetailView.vue"),
    },
    {
      path: "/animais/:id/editar",
      name: "animal-edit",
      component: () => import("../views/AnimalFormView.vue"),
    },
  ],
});

export default router;
