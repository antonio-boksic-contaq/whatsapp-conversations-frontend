<template>
  <div class="h-full flex flex-col inherit-bg">
    <!-- Filtro -->
    <div class="mb-4 p-2 border border-gray-300 bg-white rounded-xl">
      <input
        type="text"
        v-model="filter"
        placeholder="Cerca conversazione..."
        class="p-2 border rounded w-full" />
    </div>
    <!-- Lista delle conversazioni -->
    <ul class="flex-grow overflow-y-auto inherit-bg">
      <li
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        @click="selectConversation(conversation)"
        :class="[
          'scurisci-hover',
          'rounded-xl',
          'cursor-pointer',
          'p-2',
          'm-1',
          'border',
          'border-gray-400',
          getConversationClass(conversation),
        ]">
        <!-- --------------------------------------------------------------------------------- -->
        <div v-if="conversation.stato <= 1">
          <!-- friendly name e idLista -->
          <div class="mb-2 text-xl">
            <!-- Nome sopra tutto -->
            <div class="text-center">
              {{ conversation.nominativo }}
              <span
                v-if="hasUnreadMessages(conversation)"
                class="text-red-500 pl-2">
                ●
              </span>
            </div>

            <!-- FriendlyName e idLista sotto, con la notifica sulla destra -->
            <div class="text-center">
              <span>
                {{
                  conversation.friendlyName +
                  " ( idLista: " +
                  conversation.idLista +
                  " )"
                }}
              </span>
            </div>
          </div>
          <!-- info ultimo messaggio -->
          <div v-if="conversation.messages.length" class="truncate">
            <span
              v-if="
                conversation.messages[
                  conversation.messages.length - 1
                ].author.includes(conversation.friendlyName)
              ">
              {{ conversation.friendlyName + ": " }}
            </span>
            <span v-else> Tu: </span>

            <strong>
              {{ conversation.messages[conversation.messages.length - 1].body }}
            </strong>
          </div>
          <div v-else>
            <em>No messages</em>
          </div>
          <!-- data -->
          <div>
            {{
              formatDateForMsg(
                conversation.messages[conversation.messages.length - 1]
                  .dateCreated
              )
            }}
          </div>
        </div>
        <!-- --------------------------------------------------------------------------------- -->
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, onBeforeMount, watch } from "vue";
import { isOlderThan24Hours } from "@/utils/conversationChecks.js";
import { formatDateForMsg } from "@/utils/date.js";

export default {
  name: "ConversationsList",
  props: ["conversations", "selectedConversation", "identity"],
  emits: ["conversationSelected", "getConvs"],
  setup(props, context) {
    const filter = ref("");
    const selectedConversation = ref({});

    onBeforeMount(async () => {
      console.log("props.conversations", props.conversations);
      console.log(
        "SELECTED CONVERSATION ON MOUNTED",
        selectedConversation.value
      );
    });

    const selectConversation = (conversation) => {
      selectedConversation.value = conversation;
      console.log(
        "selecconv.value",
        selectedConversation.value,
        "conversation",
        conversation
      );
      context.emit("conversationSelected", conversation);
    };

    const filteredConversations = computed(() => {
      if (!filter.value) {
        return props.conversations;
      }
      return props.conversations.filter(
        (conversation) =>
          conversation.friendlyName
            ?.toLowerCase()
            .includes(filter.value.toLowerCase()) ||
          conversation.idLista
            ?.toString()
            .includes(filter.value.toLowerCase()) ||
          conversation.nominativo
            ?.toLowerCase()
            .includes(filter.value.toLowerCase()) // Aggiunto il controllo per nominativo
      );
    });

    // questa viene chiamata da ogni conversazione e gestisce il pallino della notifica
    const hasUnreadMessages = (conversation) => {
      const lastMessageIndex =
        conversation.messages[conversation.messages.length - 1].state.index;
      // console.log("conv friendly name", conversation.friendlyName);
      // console.log("conv lastMessageIndex", lastMessageIndex);
      // console.log("identity loggata", props.identity);

      const loggedInParticipant = conversation.participants.find(
        (participant) =>
          participant.state.identity === props.identity.toString()
      );

      // console.log("LOGGEDINPAARTICIPANT", loggedInParticipant);

      const lastReadMessageIndex =
        loggedInParticipant.state.lastReadMessageIndex;

      // questo mi serve quando ho solo inviato un messaggio ( dato che l'ho inviato io non viene segnato come letto da Twilio e quindi lastReadMessageIndex in questo caso sarebbe null)
      if (lastReadMessageIndex === null) {
        return false;
      }

      return lastMessageIndex !== lastReadMessageIndex;
    };

    // con questa watch se ricevo messaggio su conversazione aperta non appare il pallino della notifica
    // perchè il conversation.setAllMessagesRead() viene altrimenti chiamato solo quando seleziono/clicco una conversazione
    watch(
      () => props.selectedConversation?.messages.length,
      async (newVal, oldVal) => {
        if (newVal > oldVal) {
          //segno tutti i messaggi letti nella selected conversation
          await props.selectedConversation.setAllMessagesRead();

          //AVREI VOLUTO FARLO COSì: SOSTITUIRE OGGETTO NELLA LISTA CHE VIENE RENDERIZZATA IN MODO DA RIAPPLICARE LA LOGICA DI HASUNREADMESSAGES SU RERENDER
          // MA NELLA COPIA DELL'OGGETTO PERDO DELLE PROPRIETà COME ad esempio: friendlyName, SetAllMessagesRead
          // const matchingIndex = filteredConversations.value.findIndex(
          //   (conv) => conv.sid === props.selectedConversation.sid
          // );

          // filteredConversations.value[matchingIndex] = {
          //   ...props.selectedConversation,
          // };

          //quindi ho deciso di ricaricare direttamente le conversazioni
          context.emit("getConvs", true);

          //quando le ricarica mi leva la notifica perchè cmq selectedConversation mantiene il collegamento con Twilio e quindi su Twilio risultano appunto letti, vanno solo ricaricati come faccio appunto sopra con l'emit
        }
      }
    );

    const getConversationClass = (conversation) => {
      let baseClass = "";
      if (conversation.stato === 1) {
        baseClass = "closed-conv";
      } else if (conversation.esito === "APPUNTAMENTO") {
        baseClass = "appointment-conv";
      } else if (isOlderThan24Hours(conversation)) {
        baseClass = "expired-conv";
      } else {
        baseClass = "inherit-bg";
      }

      if (
        selectedConversation.value &&
        selectedConversation.value.sid === conversation.sid
      ) {
        return `${baseClass} selected`; // Scurisce il colore di base del 20%
      }

      return baseClass;
    };

    return {
      filter,
      filteredConversations,
      selectConversation,
      isOlderThan24Hours,
      formatDateForMsg,
      hasUnreadMessages,
      getConversationClass,
    };
  },
};
</script>
