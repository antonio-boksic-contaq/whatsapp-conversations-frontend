<template>
  <div class="flex items-center justify-center h-auto">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-6 text-center">
        Inserisci la tua Login Operatore per poter visualizzare le conversazioni
        whatsapp
      </h1>
      <form @submit.prevent="login">
        <div class="mb-4">
          <input
            v-model="identity"
            type="number"
            placeholder="Codice Login Operatore"
            required
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button
          type="submit"
          class="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Conferma
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useIdentityStore } from "@/store/identity.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const identityStore = useIdentityStore();
    const identity = ref(identityStore.identity);
    const router = useRouter();

    const login = () => {
      identityStore.identity = identity.value;
      router.push({ name: "conversazioni-whatsapp" });
    };

    return {
      identity,
      login,
    };
  },
};
</script>

<style scoped>
/* Aggiungi il tuo stile qui se necessario */
</style>
