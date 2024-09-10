<template>
  <div :class="containerClass" @click="onWrapperClick">
    <AppTopBar @menu-toggle="onMenuToggle" />
  </div>
  <div class="pt-28 px-20">
    <div class="layout-main">
      <router-view />
    </div>
  </div>
</template>

<script>
import { computed, onBeforeMount, ref } from "vue";
import AppTopBar from "@/components/menu/AppTopbar.vue";
// import DefaultMenu from "./service/DefaultMenu";
import Menu from "@/service/Menu";
import { useAuthStore } from "@/store/auth";
import { useSettingStore } from "@/store/settings";

export default {
  components: {
    AppTopBar: AppTopBar,
  },
  setup() {
    const layoutMode = ref("static");
    const staticMenuInactive = ref(false);
    const overlayMenuActive = ref(false);
    const mobileMenuActive = ref(false);
    const menuClick = ref(false);
    const menu = ref(Menu);
    const authStore = useAuthStore();
    const settingStore = useSettingStore();

    onBeforeMount(() => {
      document.documentElement.style.fontSize = settingStore.fontSize + "px";
      if (settingStore.darkMode)
        document.querySelector("html").setAttribute("theme", "dark");
      if (!settingStore.darkMode)
        document.querySelector("html").setAttribute("theme", "light");
    });

    const onWrapperClick = () => {
      if (!menuClick.value) {
        overlayMenuActive.value = false;
        mobileMenuActive.value = false;
      }

      menuClick.value = false;
    };

    const onMenuToggle = (event) => {
      menuClick.value = true;

      if (isDesktop()) {
        if (layoutMode.value === "overlay") {
          if (mobileMenuActive.value === true) {
            overlayMenuActive.value = true;
          }

          overlayMenuActive.value = !overlayMenuActive.value;
          mobileMenuActive.value = false;
        } else if (layoutMode.value === "static") {
          staticMenuInactive.value = !staticMenuInactive.value;
        }
      } else {
        mobileMenuActive.value = !mobileMenuActive.value;
      }

      event.preventDefault();
    };

    const onSidebarClick = () => {
      menuClick.value = true;
    };

    const onMenuItemClick = (event) => {
      if (event.item && !event.item.items) {
        overlayMenuActive.value = false;
        mobileMenuActive.value = false;
      }
    };

    const addClass = (element, className) => {
      if (element.classList) element.classList.add(className);
      else element.className += " " + className;
    };

    const removeClass = (element, className) => {
      if (element.classList) element.classList.remove(className);
      else
        element.className = element.className.replace(
          new RegExp(
            "(^|\\b)" + className.split(" ").join("|") + "(\\b|$)",
            "gi"
          ),
          " "
        );
    };

    const isDesktop = () => {
      return window.innerWidth >= 992;
    };

    const containerClass = computed(() => {
      return [
        "layout-wrapper",
        {
          "layout-overlay": layoutMode.value === "overlay",
          "layout-static": layoutMode.value === "static",
          "layout-static-sidebar-inactive":
            staticMenuInactive.value && layoutMode.value === "static",
          "layout-overlay-sidebar-active":
            overlayMenuActive.value && layoutMode.value === "overlay",
          "layout-mobile-sidebar-active": mobileMenuActive.value,
        },
      ];
    });

    return {
      addClass,
      containerClass,
      layoutMode,
      authStore,
      menu,
      onMenuItemClick,
      onMenuToggle,
      onSidebarClick,
      onWrapperClick,
      removeClass,
    };
  },
};
</script>

<style>
.expired-conv {
  background-color: rgb(254 202 202) !important;
}
/* 254 202 202 */
.appointment-conv {
  background-color: rgb(121, 161, 255) !important;
}

.closed-conv {
  background-color: rgb(121, 255, 177) !important;
}

.inherit-bg {
  background-color: inherit;
}

.selected {
  filter: brightness(80%) !important;
}

:hover.scurisci-hover {
  filter: brightness(85%) /*!important*/; /* qua posso levare !important se non voglio applicare hover su conversazione selezionata*/
}
</style>
