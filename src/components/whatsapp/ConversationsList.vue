<template>
  <div class="h-full flex flex-col">
    <!-- Filtro -->
    <div class="mb-4 p-2 border border-gray-300 bg-white rounded-xl">
      <input
        type="text"
        v-model="filter"
        placeholder="Cerca per numero di telefono o idLista..."
        class="p-2 border rounded w-full" />
    </div>
    <!-- Lista delle conversazioni -->
    <ul class="flex-grow overflow-y-auto">
      <li
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        @click="selectConversation(conversation)"
        class="cursor-pointer hover:bg-gray-300 p-2 rounded-xl m-1 border border-gray-400"
        :class="{
          'bg-gray-400':
            selectedConversation &&
            selectedConversation.sid === conversation.sid,
          'bg-red-200': isOlderThan24Hours(conversation),
        }">
        <!-- friendly name e idLista -->
        <div class="mb-2 text-center text-xl">
          {{
            conversation.friendlyName +
            " (idLista: " +
            conversation.idLista +
            " )"
          }}
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
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, onBeforeMount } from "vue";
import { isOlderThan24Hours } from "@/utils/conversationChecks.js";
import { formatDateForMsg } from "@/utils/date.js";

export default {
  name: "ConversationsList",
  props: ["conversations", "selectedConversation"],
  emits: ["conversationSelected"],
  setup(props, context) {
    const filter = ref("");
    const selectedConversation = ref({});

    onBeforeMount(async () => {
      // console.log("props.conversations", props.conversations);
    });

    const selectConversation = (conversation) => {
      selectedConversation.value = conversation;
      // console.log(
      //   "selecconv.value",
      //   selectedConversation.value,
      //   "conversation",
      //   conversation
      // );
      context.emit("conversationSelected", conversation);
    };

    const filteredConversations = computed(() => {
      if (!filter.value) {
        return props.conversations;
      }
      return props.conversations.filter(
        (conversation) =>
          conversation.friendlyName
            .toLowerCase()
            .includes(filter.value.toLowerCase()) ||
          conversation.idLista.toString().includes(filter.value.toLowerCase())
      );
    });

    return {
      filter,
      filteredConversations,
      selectConversation,
      isOlderThan24Hours,
      formatDateForMsg,
    };
  },
};
</script>
