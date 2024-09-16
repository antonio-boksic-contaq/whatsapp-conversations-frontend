<template>
  <loading />
  <!-- PARTE LOGIN -->
  <div
    class="grid grid-cols-5 h-auto gap-7 mx-0 mb-5 items-center bg-gray-300 border border-gray-400 p-2 rounded-xl">
    <div class="col-start-1 flex justify-around text-xl font-bold p-2">
      <div>Login Operatore:</div>
      <div>{{ identity }}</div>
    </div>
    <div class="col-start-5 text-right">
      <Button
        @click="changeIdentity"
        class="p-2 bg-blue-500 hover:bg-blue-600 text-white p-button-rounded">
        Cambia login utente
        <font-awesome-icon class="mx-2" :icon="['fas', 'user']" />
      </Button>
    </div>
  </div>

  <!-- PARTE PRINCIPALE -->
  <div class="grid grid-cols-5 gap-7 mx-0 mb-10 h-[80vh] overflow-hidden">
    <!-- PARTE SINISTRA -->
    <div
      class="col-start-1 rounded-xl p-2 h-full border border-gray-400 flex flex-col bg-gray-300">
      <!-- Lista delle conversazioni -->
      <div
        class="flex-grow h-[300px] overflow-y-auto rounded-xl border border-gray-400 bg-gray-300 p-2">
        <conversations-list
          :conversations="conversations"
          :identity="identity"
          :selectedConversation="selectedConversation"
          @conversationSelected="selectConversation"
          @getConvs="getConversations">
        </conversations-list>
      </div>

      <!-- Legenda-->
      <div class="p-4 mb-2 rounded-xl border border-gray-400 bg-gray-300 mt-2">
        <div class="text-center">Legenda colori conversazioni:</div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
          <div
            class="bg-gray-300 border border-gray-400 text-black p-2 rounded-xl text-center truncate">
            aperta
          </div>
          <div
            class="appointment-conv border border-gray-400 text-black p-2 rounded-xl text-center truncate">
            appuntamento
          </div>
          <div
            class="expired-conv border border-gray-400 text-black p-2 rounded-xl text-center truncate">
            scaduta
          </div>
          <div
            class="closed-conv border border-gray-400 text-black p-2 rounded-xl text-center truncate">
            chiusa
          </div>
        </div>
      </div>
    </div>
    <!-- PARTE DESTRA -->
    <div
      class="col-start-2 col-end-6 p-4 border border-gray-400 rounded-xl flex flex-col h-full overflow-hidden bg-gray-300">
      <div v-if="selectedConversation" class="flex flex-col h-full">
        <!-- intestazione conversazione selezionata -->
        <div
          class="intestazioneconversazione mb-4 border-b border-gray-500 p-4">
          <!-- Primo div centrato -->
          <div class="text-center">
            <h2 class="text-3xl font-bold text-black">
              {{
                "numero: " +
                selectedConversation.friendlyName +
                " - idLista: " +
                selectedConversation.idLista +
                " - nominativo: " +
                selectedConversation.nominativo +
                " - idCampagna: " +
                selectedConversation.idCampagna
              }}
            </h2>
          </div>

          <!-- bottoni sotto intestazione -->
          <div
            v-if="
              !(
                selectedConversation.stato === 1 ||
                selectedConversation.esito === 'APPUNTAMENTO' ||
                isOlderThan24Hours(selectedConversation)
              )
            "
            class="text-center mt-2 flex justify-center gap-3">
            <button
              class="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl"
              style="font-size: 1.4rem !important"
              @click="openModal(selectedConversation, 'appuntamento')">
              Fissa appuntamento

              <font-awesome-icon
                class="mx-2"
                :icon="['fas', 'calendar-plus']" />
            </button>

            <button
              class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl"
              style="font-size: 1.4rem !important"
              @click="openConfirm(selectedConversation, 'conversazione')">
              Non interessato
              <font-awesome-icon
                class="mx-2"
                :icon="['fas', 'calendar-minus']" />
            </button>
          </div>
        </div>

        <!-- lista dei messaggi -->
        <ul class="flex-grow overflow-y-auto mb-4 flex flex-col-reverse">
          <li
            v-for="message in [...selectedConversation.messages].reverse()"
            :key="message.sid"
            :class="messageClass(selectedConversation, message)"
            class="mb-2 p-2 rounded-2xl w-fit msgWidth">
            <div>
              {{ message.body }}
            </div>
            <!-- <div>
              "lastReadMessageIndex"
              {{ loggedInParticipant.state.lastReadMessageIndex }}
            </div>
            <div>
              "lastmessageindex"
              {{
                selectedConversation.messages[
                  selectedConversation.messages.length - 1
                ].state.index
              }}
            </div> -->
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
          class="border-t border-gray-300 bg-white p-4 rounded-xl">
          <div class="flex">
            <input
              type="text"
              v-model="newMessage"
              @keyup.enter="sendMessage(selectedConversation)"
              placeholder="Scrivi un messaggio..."
              class="flex-grow p-2 border border-gray-300 rounded" />
            <button
              @click="addLinkToNewMessage()"
              class="ml-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              Incolla link brochure
            </button>
          </div>
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
  <whatsapp-conversations-modal @fetchData="getConversations" />
  <confirm></confirm>
</template>

<script>
import { ref, onBeforeMount } from "vue";
import { useApiStore } from "@/store/api";
import ConversationsList from "@/components/whatsapp/ConversationsList.vue";
import WhatsappConversationsModal from "@/components/modals/WhatsappConversationsModal.vue";
import Loading from "@/components/shared/Loading.vue";
import { isOlderThan24Hours } from "@/utils/conversationChecks.js";
import { Client } from "@twilio/conversations";
import { useLoadingStore } from "@/store/loadings";
import { formatDateForMsg } from "@/utils/date.js";
import { useIdentityStore } from "@/store/identity.js";
import { useRouter } from "vue-router";
import { useModalStore } from "@/store/modals";
import { useFormStore } from "@/store/forms";
import { useConfirmStore } from "@/store/confirms";
import Confirm from "@/components/shared/Confirm.vue";

export default {
  name: "WhatsappConversationsView",
  components: {
    ConversationsList,
    Loading,
    WhatsappConversationsModal,
    Confirm,
  },
  setup() {
    const apiStore = useApiStore();
    const loadingStore = useLoadingStore();
    const identityStore = useIdentityStore();
    const router = useRouter();

    const conversations = ref([]);
    const selectedConversation = ref(null);
    const newMessage = ref("");
    const myPhoneNumber = "whatsapp:+393399951509";
    // todo gestire identity dinamiche (sarebbe login operatore)
    const identity = ref(identityStore.identity);
    const token = ref("");
    const client = ref(null);
    const modalStore = useModalStore();
    const formStore = useFormStore();
    const confirmStore = useConfirmStore();

    const getToken = async () => {
      const url =
        process.env.VUE_APP_API_URL +
        "/generate-token" +
        "?identity=" +
        identity.value;
      const response = await apiStore.fetch(url);
      token.value = response;
    };

    const connectToTwilio = async () => {
      console.log("CONNECTING TO TWILIO, IDENTITY:", identity.value);
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

          //riordina conversazioni in base a ultimo messaggio
          sortConversations();
        }
      });

      // QUESTO è IL LISTENER CHE SI ATTIVA QUANDO C'è UNA NUOVA CONVERSAZIONE
      // dato che parte prima del getConversations, voglio disattivarlo prima che venga chiamato getConversations perchè è inutile
      // a parte che non capisco perchè parte questo listener per ogni conversazione sul mounted...
      client.value.on("conversationAdded", async (conversation) => {
        if (conversations.value.length !== 0) {
          console.log("New conversation added:", conversation);
          // console.log(
          //   "New conversation conversation.items:",
          //   conversation.items
          // );

          await addDataToConvs(conversation, true);

          sortConversations();
        }
      });
    };

    const loggedInParticipant = ref({});

    const getConversations = async () => {
      //console.log("emit chiama getconversations------------------------");
      //ottengo conversazioni non ordinate e a cui mancano dati, e ne ricevo solo 50 con getSubscrivedConversations(), quindi ho dovuto aggiungere logica del paginator
      let convs = { items: [] }; // mantengo  la struttura convs.items come era prima di implementare paginator
      let paginator = await client.value.getSubscribedConversations();

      // Aggiungi le prime conversazioni a convs.items
      convs.items.push(...paginator.items);

      // Continua a ottenere pagine di conversazioni finché ci sono pagine successive
      while (paginator.hasNextPage) {
        paginator = await paginator.nextPage();
        convs.items.push(...paginator.items);
      }
      if (!convs.items.length > 0) {
        return;
      }

      console.log("convs prese da twilio ++++++++", convs.items);

      // console.log("convs", convs);
      //aggiungi idlista,nominativo,partecipanti,messaggi eccecc
      await addDataToConvs(convs);

      console.log("aggiunto dati alle convs ///////////");

      // ordina cronologicamente le conversazioni in base a ultimo messaggio
      sortConversations();

      //conversations.value = convsWithDetails;
      // console.log("CONVERSATIONS", conversations.value);
      loggedInParticipant.value = conversations.value[0].participants.find(
        (participant) =>
          participant.state.identity === identity.value.toString()
      );
    };

    const sortConversations = () => {
      conversations.value.sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1];
        const lastMessageB = b.messages[b.messages.length - 1];

        // Controlla se ci sono messaggi
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;

        return (
          new Date(lastMessageB.dateCreated) -
          new Date(lastMessageA.dateCreated)
        );
      });
    };

    const getInternalDataForConvs = async (friendlyNamesArray) => {
      const params = { friendlyNames: friendlyNamesArray.join(",") };

      const url = process.env.VUE_APP_API_URL + "/get-data-for-convs";

      const response = await apiStore.fetch(url, params);
      console.log("response", response);
      return response;
    };

    // const deleteItem = (rowItem, itemText = null) => {
    //   confirmStore.route = url;
    //   confirmStore.open(rowItem, "delete", props.field, itemText);
    // };

    const selectConversation = async (conversation) => {
      console.log("lunghezza", conversation.messages.length);
      await conversation.setAllMessagesRead();
      selectedConversation.value = conversation;
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

    const messageClass = (selectedConversation, message) => {
      return message.author.includes(selectedConversation.friendlyName)
        ? "received-message"
        : "sent-message";
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

    const changeIdentity = () => {
      router.push({ name: "whatsapp-login" });
    };

    const addLinkToNewMessage = () => {
      const link =
        "https://azionecontrolafame.b-cdn.net/wp-assets/uploads/2024/06/Brochure-2025_-DEF.pdf ";

      newMessage.value = `${newMessage.value} ${link}`;
    };

    const addDataToConvs = async (convs, justOneConv = false) => {
      //se la conversazione è singola convs non avrà proprietà items, che nel caso di convs multiple contiene appunto gli oggetti delle conversazioni
      ////Dato che uso map su conversationsTOHandle ho bisogno che questo sia sempre un array, se convs.items esiste non c'è problema, altrimenti avvolgiamo convs in un array
      const conversationsToHandle = convs.items ? convs.items : [convs];

      console.log("conversationstohandle", conversationsToHandle);

      // console.log("conversationsToHandle", conversationsToHandle);

      const friendlyNames = conversationsToHandle.map(
        (conversation) => conversation.friendlyName
      );

      // console.log("FRIENDLY NAMES", friendlyNames);

      //con numeri di telefono trovo idLista associati
      const idListe = await getInternalDataForConvs(friendlyNames);
      // console.log("idListe", idListe);

      const idListaLookup = idListe.reduce((acc, item) => {
        acc[item.friendlyName] = item.idLista;
        return acc;
      }, {});

      const nominativoLookup = idListe.reduce((acc, item) => {
        acc[item.friendlyName] = item.nominativo;
        return acc;
      }, {});

      const statoLookup = idListe.reduce((acc, item) => {
        acc[item.friendlyName] = item.stato;
        return acc;
      }, {});

      const esitoLookup = idListe.reduce((acc, item) => {
        acc[item.friendlyName] = item.esito;
        return acc;
      }, {});

      const idCampagnaLookup = idListe.reduce((acc, item) => {
        acc[item.friendlyName] = item.idCampagna;
        return acc;
      }, {});

      // console.log("nominativolookup", nominativoLookup);
      // console.log("statolookup", statoLookup);

      const convsWithDetails = await Promise.all(
        conversationsToHandle.map(async (conversation) => {
          // prendo messaggi della conversazione
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

          // Aggiungo idLista e nominativo preso da query alla conversazione
          conversation.idLista =
            idListaLookup[conversation.friendlyName] || null;
          conversation.nominativo =
            nominativoLookup[conversation.friendlyName] || null;
          conversation.stato = statoLookup[conversation.friendlyName]; //levato || null perchè lo 0 lo faceva diventare null
          conversation.esito = esitoLookup[conversation.friendlyName] || null;
          conversation.idCampagna =
            idCampagnaLookup[conversation.friendlyName] || null;

          return conversation;
        })
      );

      console.log("convwithdetails", convsWithDetails);
      if (justOneConv) {
        conversations.value.push(convsWithDetails[0]);
      } else {
        conversations.value = convsWithDetails;
      }
    };

    const urlScheduleAppointment =
      process.env.VUE_APP_API_URL + "/schedule-appointment";

    const urlNotInterested = process.env.VUE_APP_API_URL + "/not-interested";

    const openModal = async (selectedConv, action) => {
      // console.log(
      //   "identity",
      //   identity.value,
      //   "conv.idLista",
      //   selectedConv.idLista
      // );

      if (action === "appuntamento") {
        modalStore.open(
          `appuntamento per idLista: ${selectedConv.idLista}`,
          "aggiungi"
        );
        formStore.fill("add", urlScheduleAppointment);
        formStore.formToShow = action;
        modalStore.modalToShow = "appointment";
        formStore.data = {
          ...selectedConv,
          login: identityStore.identity,
        };
      }
    };

    const openConfirm = (conversation, itemText = null) => {
      confirmStore.route = urlNotInterested;
      confirmStore.open(conversation, "non-interessato", "bo", itemText);
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
      getInternalDataForConvs,
      formatDateForMsg,
      changeIdentity,
      addLinkToNewMessage,
      getConversations,
      loggedInParticipant,
      openModal,
      openConfirm,
    };
  },
};
</script>

<style>
.sent-message {
  background-color: #c6f8c9;
  /*background-color: #005c4b;*/
  /* color: white; */
  margin-left: auto;
}
.received-message {
  background-color: #d2d2d2;
  /* color: white; */
  /*background-color: #202c33;*/
}

.msgWidth {
  min-width: 15%;
  max-width: 60%;
}
</style>
