import { createRouter, createWebHashHistory } from "vue-router";
// import { useAuthStore } from "@/store/auth";
import { useIdentityStore } from "@/store/identity.js";

const routes = [
  // CUSTOM PAGES
  //home
  // END CUSTOM PAGES
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/home/DashboardView.vue"),
    meta: {
      authRequired: false,
      roles: ["System Admin"],
      title: "Dashboard",
    },
  },
  {
    path: "/",
    name: "login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: {
      authRequired: false,
      roles: [],
      title: "Login",
    },
  },
  {
    path: "/whatsapp-login",
    name: "whatsapp-login",
    component: () => import("@/views/auth/WhatsappLogin.vue"),
  },
  {
    path: "/conversazioni-whatsapp",
    name: "conversazioni-whatsapp",
    component: () => import("@/views/home/WhatsappConversationsView.vue"),
    meta: {
      authRequired: false,
      roles: [],
      title: "Conversazioni Whatsapp",
      whatsappIdentityRequired: true,
    },
  },
  {
    path: "/recupera-password",
    name: "recupera-password",
    component: () => import("@/views/auth/PasswordRecoveryView.vue"),
    meta: {
      authRequired: false,
      roles: [],
      title: "Recupera password",
    },
  },
  {
    path: "/non-autorizzato",
    name: "non-autorizzato",
    component: () => import("@/views/auth/UnauthorizedView.vue"),
    meta: {
      authRequired: false,
      roles: [],
      title: "Non autorizzato",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return {
      top: 0,
      left: 0,
      behavior: "smooth",
    };
  },
});

router.beforeEach((to, from, next) => {
  const identityStore = useIdentityStore();
  // const authStore = useAuthStore();
  document.title = "ContaQ CRM - " + to.meta.title;
  //if (to.meta.authRequired === true) {
  // if (authStore.isLoggedIn === false) router.push("/");
  // if (to.meta.roles.includes(authStore.user.role)) return next();
  // router.push("/non-autorizzato");
  //} else {
  //return next();
  //}

  if (to.meta.whatsappIdentityRequired === true) {
    if (!identityStore.identity) {
      return next({ name: "whatsapp-login" });
    }
  }

  return next();
});

export default router;
