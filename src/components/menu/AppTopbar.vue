<template>
  <div class="layout-topbar bg-primary">
    <div class="layout-topbar-logo">
      <img alt="Logo" :src="imgFolderPath + '/logo.png'" />
    </div>

    <button
      class="p-link layout-topbar-menu-button layout-topbar-button"
      v-styleclass="{
        selector: '@next',
        enterClass: 'hidden',
        enterActiveClass: 'scalein',
        leaveToClass: 'hidden',
        leaveActiveClass: 'fadeout',
        hideOnOutsideClick: true,
      }">
      <i class="pi pi-ellipsis-v"></i>
    </button>
    <ul class="layout-topbar-menu hidden lg:flex lg:items-center origin-top">
      <li class="mr-10">
        <div>
          <i class="pi pi-sun mr-3 text-3xl"></i>
          <input-switch
            @click="settingStore.toggleDarkMode"
            v-model="settingStore.darkMode"
            class="mt-1" />
          <i class="pi pi-moon ml-3 text-2xl"></i>
        </div>
      </li>
      <li>
        <button class="layout-topbar-button" @click="zoomPanelToggle">
          <i class="pi pi-search-plus text-white"></i>
          <span>Zoom</span>
        </button>
        <Transition name="bounce">
          <div
            ref="zoomPanelContainer"
            v-if="zoomPanel"
            class="absolute top-24 right-6 bg-white border-gray-600 p-2 rounded-2xl shadow-lg z-1 pt-6">
            <div class="config-scale mt-4">
              <Button
                icon="pi pi-times"
                @click="hideZoomPanel"
                class="p-button-rounded p-button-danger p-button-text absolute top-2 right-0 mr-0"></Button>

              <Button
                icon="pi pi-minus"
                @click="decrementScale()"
                class="p-button-text"
                :disabled="settingStore.fontSize === scales[0]" />
              <i
                class="pi pi-circle-on [&:not(:last-child)]:m-1"
                v-for="s of scales"
                :class="{
                  'scale-active': settingStore.fontSize === s,
                }"
                :key="s" />
              <Button
                icon="pi pi-plus"
                @click="incrementScale()"
                class="p-button-text"
                :disabled="
                  settingStore.fontSize === scales[scales.length - 1]
                " />
            </div>
          </div>
        </Transition>
      </li>
    </ul>
  </div>
</template>
<script>
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useAuthStore } from "@/store/auth";
import { usePasswordModalStore } from "@/store/password-modal";
import { useFormStore } from "@/store/forms";
import { useSettingStore } from "@/store/settings";

export default {
  name: "AppTopbar",
  emits: ["menu-toggle"],
  components: {},
  setup() {
    const zoomPanel = ref(false);
    const zoomPanelContainer = ref(null);
    const imgFolderPath = process.env.VUE_APP_IMG_FOLDER_PATH;

    const passwordModalStore = usePasswordModalStore();
    const authStore = useAuthStore();
    const settingStore = useSettingStore();
    const formStore = useFormStore();

    const hideZoomPanel = () => {
      zoomPanel.value = false;
    };

    onClickOutside(zoomPanelContainer, () => (zoomPanel.value = false));

    const openModal = () => {
      formStore.formToShow = "change password";
      formStore.fill("edit", "");
      passwordModalStore.isOpen = true;
    };

    const scales = ref([8, 9, 10, 11, 12, 13, 14]);
    const decrementScale = () => {
      settingStore.fontSize--;
      applyScale();
    };
    const incrementScale = () => {
      settingStore.fontSize++;
      applyScale();
    };
    const applyScale = () => {
      document.documentElement.style.fontSize = settingStore.fontSize + "px";
    };
    const zoomPanelToggle = () => {
      zoomPanel.value = !zoomPanel.value;
    };

    return {
      authStore,
      decrementScale,
      hideZoomPanel,
      imgFolderPath,
      incrementScale,
      openModal,
      settingStore,
      scales,
      zoomPanel,
      zoomPanelContainer,
      zoomPanelToggle,
    };
  },
};
</script>
