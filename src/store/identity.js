import { defineStore } from "pinia";

export const useIdentityStore = defineStore("identity", {
  state: () => {
    return {
      identity: null,
    };
  },
  persist: true,
  actions: {},
});
