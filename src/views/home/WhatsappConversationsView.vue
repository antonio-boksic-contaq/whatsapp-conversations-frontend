<template>
  <loading />
  <div class="grid grid-cols-5 gap-7 mx-0 mb-10 h-[60vh] overflow-hidden">
    <!-- PARTE SINISTRA -->
    <div class="col-start-1 bg-gray-200 rounded p-2 overflow-y-auto h-full">
      <conversations-list
        :conversations="conversations"
        :selectedConversation="selectedConversation"
        @conversationSelected="selectConversation">
      </conversations-list>
    </div>
    <!-- PARTE DESTRA -->
    <div
      class="col-start-2 col-end-6 p-4 border border-gray-300 rounded flex flex-col h-full overflow-hidden">
      <div v-if="selectedConversation" class="flex flex-col h-full">
        <h2 class="text-lg font-bold mb-4 border-b border-gray-300 p-4">
          {{ selectedConversation.friendlyName }}
        </h2>
        <!-- lista dei messaggi -->
        <ul class="flex-grow overflow-y-auto mb-4 flex flex-col-reverse">
          <li
            v-for="message in [...selectedConversation.messages].reverse()"
            :key="message.sid"
            :class="messageClass(message)"
            class="mb-2 p-2 rounded w-1/2">
            <div>
              {{ message.body }}
            </div>
            <div>
              {{ message.dateCreated }}
            </div>
          </li>
        </ul>
        <!-- input per nuovi messaggi -->
        <div
          v-if="!isOlderThan24Hours(selectedConversation)"
          class="border-t border-gray-300 bg-white p-4">
          <input
            type="text"
            v-model="newMessage"
            @keyup.enter="sendMessage(selectedConversation.sid)"
            placeholder="Scrivi un messaggio..."
            class="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div
          v-else
          class="border-t border-gray-300 p-4 text-xl text-red bg-slate-500 rounded text-center w-full">
          Rivolgiti al Team IT per contattare tramite whatsapp questo contatto.
        </div>
      </div>
      <div v-else>
        <p>Seleziona una conversazione per visualizzare i messaggi.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeMount } from "vue";
import { useApiStore } from "@/store/api";
import ConversationsList from "@/components/whatsapp/ConversationsList.vue";
import Loading from "@/components/shared/Loading.vue";
import { useLoadingStore } from "@/store/loadings";
import { isOlderThan24Hours } from "@/utils/conversationChecks.js";

export default {
  name: "WhatsappConversationsView",
  components: {
    ConversationsList,
    Loading,
  },
  setup() {
    const apiStore = useApiStore();
    const loadingStore = useLoadingStore();
    const url = process.env.VUE_APP_API_URL + "/list-conversations";

    const conversations = ref([]);
    const selectedConversation = ref(null);
    const newMessage = ref("");
    const myPhoneNumber = "whatsapp:+393399951509";

    const selectConversation = (conversation) => {
      selectedConversation.value = conversation;
      console.log(
        "NELL EMIT DEL PADRE Selected conversation:",
        selectedConversation.value
      );
    };

    const sendMessage = (selectedConversationSid) => {
      if (newMessage.value.trim() === "") return;

      const formData = new FormData();
      formData.append("msg_body", newMessage.value);
      formData.append("convSid", selectedConversationSid);

      const urlsendMessage =
        process.env.VUE_APP_API_URL + "/send-message-to-conversation";
      console.log("formdata", formData);
      apiStore.store(urlsendMessage, formData);

      newMessage.value = "";
    };

    const messageClass = (message) => {
      return message.author === myPhoneNumber
        ? "sent-message"
        : "received-message";
    };

    onBeforeMount(async () => {
      await fetchConversations();
    });

    const fetchConversations = async () => {
      loadingStore.load();
      conversations.value = await apiStore.fetch(url);
      loadingStore.stop();
      console.log("Fetched conversations:", conversations.value);
    };

    return {
      conversations,
      selectedConversation,
      newMessage,
      myPhoneNumber,
      selectConversation,
      sendMessage,
      messageClass,
      fetchConversations,
      isOlderThan24Hours,
    };
  },
};
</script>

<style>
.sent-message {
  background-color: #c6f8c9;
}
.received-message {
  background-color: #d2d2d2;
  margin-left: auto;
}
</style>
