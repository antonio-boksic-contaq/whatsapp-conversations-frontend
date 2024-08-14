<template>
  <loading />
  <div class="grid grid-cols-5 gap-7 mx-0 mb-10 h-[80vh] overflow-hidden">
    <!-- PARTE SINISTRA -->
    <div
      class="col-start-1 bg-gray-200 rounded p-2 overflow-y-auto h-full border border-gray-300">
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
        <h2
          class="text-3xl text-center font-bold mb-4 border-b border-gray-300 p-4 text-black">
          {{
            selectedConversation.friendlyName +
            " - idLista: " +
            selectedConversation.idLista
          }}
          <!-- <div
            v-for="participant in selectedConversation.participants"
            :key="participant.sid">
            {{
              participant.identity
                ? participant.identity
                : participant.bindings.whatsapp.address
            }}
          </div> -->
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
            <div class="text-right mt-2">
              {{ formatDateForMsg(message.dateCreated) }}
            </div>
            <!-- <div v-if="message.deliveryReceipts">
              <span>Inviati: {{ message.deliveryReceipts.sent }}</span>
              <span>Consegnati: {{ message.deliveryReceipts.delivered }}</span>
              <span>Letti: {{ message.deliveryReceipts.read }}</span>
              <span>Falliti: {{ message.deliveryReceipts.failed }}</span>
              <span
                >Non Consegnati:
                {{ message.deliveryReceipts.undelivered }}</span
              >
            </div> -->
          </li>
        </ul>
        <!-- input per nuovi messaggi -->
        <div
          v-if="!isOlderThan24Hours(selectedConversation)"
          class="border-t border-gray-300 bg-white p-4">
          <input
            type="text"
            v-model="newMessage"
            @keyup.enter="sendMessage(selectedConversation)"
            placeholder="Scrivi un messaggio..."
            class="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div
          v-else
          class="border-t border-gray-300 p-4 text-xl bg-red-300 rounded text-center w-full">
          Rivolgiti al Team IT per contattare tramite whatsapp questo contatto.
        </div>
      </div>
      <div
        v-else
        class="flex flex-col justify-center items-center h-full text-center">
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
import { isOlderThan24Hours } from "@/utils/conversationChecks.js";
import { Client } from "@twilio/conversations";
import { useLoadingStore } from "@/store/loadings";
import { formatDateForMsg } from "@/utils/date.js";

export default {
  name: "WhatsappConversationsView",
  components: {
    ConversationsList,
    Loading,
  },
  setup() {
    const apiStore = useApiStore();
    const loadingStore = useLoadingStore();

    const conversations = ref([]);
    const selectedConversation = ref(null);
    const newMessage = ref("");
    const myPhoneNumber = "whatsapp:+393399951509";
    const identity = "operatore_frontend";
    const token = ref("");
    const client = ref(null);

    const getToken = async () => {
      const url =
        process.env.VUE_APP_API_URL +
        "/generate-token" +
        "?identity=" +
        identity;
      const response = await apiStore.fetch(url);
      token.value = response;
    };

    const connectToTwilio = async () => {
      client.value = new Client(token.value);
      // console.log("client", client.value);

      // QUI AGGIUNGO GLI EVENTI DA ASCOLTARE

      // QUESTO è IL LISTENER CHE SI ATTIVA QUANDO C'è UN NUOVO MESSAGGIO
      client.value.on("messageAdded", async (message) => {
        console.log("New message added:", message);

        const conversation = conversations.value.find(
          (conv) => conv.sid === message.conversation.sid
        );
        console.log("conversation dove arriva messaggio", conversation);

        if (conversation) {
          const messages = await conversation.getMessages();
          conversation.messages = messages.items;
        }
      });

      // QUA MI SERVE LISTENER PER QUANDO STATO DEI MESSAGGI CAMBIA, AD ESEMPIO "RICEVUTO"/"LETTO"
    };

    const getConversations = async () => {
      const convs = await client.value.getSubscribedConversations();

      const friendlyNames = convs.items.map(
        (conversation) => conversation.friendlyName
      );

      const idListe = await getidListaForFriendlyNames(friendlyNames);

      const idListaLookup = idListe.reduce((acc, item) => {
        acc[item.friendlyName] = item.idLista;
        return acc;
      }, {});

      const convsWithDetails = await Promise.all(
        convs.items.map(async (conversation) => {
          // Ottieni i messaggi della conversazione
          const messagesResponse = await conversation.getMessages();
          // QUESTO CODICE COMMENTATO LO LASCIO MA NON CI SERVE
          // STAVO PROVANDO AD AGGIUNGERE "STA SCRIVENDO"/"VISUALIZZATO" E COSE DI QUESTO TIPO
          // const messagesWithReceipts = messagesResponse.items.map((message) => {
          //   const aggregatedDeliveryReceipt = message.aggregatedDeliveryReceipt;
          //   message.deliveryReceipts = {
          //     delivered: aggregatedDeliveryReceipt?.delivered || 0,
          //     failed: aggregatedDeliveryReceipt?.failed || 0,
          //     read: aggregatedDeliveryReceipt?.read || 0,
          //     sent: aggregatedDeliveryReceipt?.sent || 0,
          //     undelivered: aggregatedDeliveryReceipt?.undelivered || 0,
          //     total: aggregatedDeliveryReceipt?.total || 0,
          //   };
          //   return message;
          // });
          conversation.messages = messagesResponse.items;

          // Ottieni i partecipanti della conversazione
          const participantsResponse = await conversation.getParticipants();
          conversation.participants = participantsResponse;

          // Aggiungi l'idLista alla conversazione
          conversation.idLista =
            idListaLookup[conversation.friendlyName] || null;

          return conversation;
        })
      );

      conversations.value = convsWithDetails;
    };

    const getidListaForFriendlyNames = async (friendlyNamesArray) => {
      const params = { friendlyNames: friendlyNamesArray.join(",") };

      const url = process.env.VUE_APP_API_URL + "/get-id-listas-for-convs";

      const response = await apiStore.fetch(url, params);
      console.log("response", response);
      return response;
    };

    const selectConversation = (conversation) => {
      selectedConversation.value = conversation;
      // console.log(
      //   "NELL EMIT DEL PADRE Selected conversation:",
      //   selectedConversation.value
      // );
    };

    const sendMessage = async (conversation) => {
      // console.log("log di conversation in sendMessage", conversation);
      if (newMessage.value.trim() === "") return;

      // console.log("conversation", conversation);

      if (conversation) {
        await conversation.sendMessage(newMessage.value);
        loadMessages(conversation);
        newMessage.value = "";
      }
    };

    const messageClass = (message) => {
      return message.author === myPhoneNumber || message.author === identity
        ? "sent-message"
        : "received-message";
    };

    onBeforeMount(async () => {
      loadingStore.load();
      await getToken();
      await connectToTwilio();
      //await fetchConversations();
      await getConversations();
      loadingStore.stop();
    });

    const loadMessages = async (conversation) => {
      const messages = await conversation.getMessages();
      selectedConversation.value.messages = messages.items;
    };

    return {
      conversations,
      selectedConversation,
      newMessage,
      myPhoneNumber,
      selectConversation,
      sendMessage,
      messageClass,
      isOlderThan24Hours,
      token,
      client,
      identity,
      loadingStore,
      getidListaForFriendlyNames,
      formatDateForMsg,
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
