<template>
  <div class="h-full flex flex-col">
    <!-- Filtro -->
    <div class="mb-4 p-2 border-b bg-white rounded-xl">
      <input
        type="text"
        v-model="filter"
        placeholder="Cerca conversazione..."
        class="p-2 border rounded w-full" />
    </div>
    <!-- Lista delle conversazioni -->
    <ul class="flex-grow overflow-y-auto">
      <li
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        @click="selectConversation(conversation)"
        class="cursor-pointer hover:bg-gray-300 p-2 rounded-xl m-1"
        :class="{
          'bg-gray-400':
            selectedConversation &&
            selectedConversation.sid === conversation.sid,
          'bg-red-200': isOlderThan24Hours(conversation),
        }">
        <div>
          {{ conversation.friendlyName }}
        </div>
        <div v-if="conversation.messages.length">
          {{ conversation.messages[conversation.messages.length - 1].author }}
          <strong>
            {{ conversation.messages[conversation.messages.length - 1].body }}
          </strong>
          {{
            conversation.messages[conversation.messages.length - 1].dateCreated
          }}
        </div>
        <div v-else>
          <em>No messages</em>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { isOlderThan24Hours } from "@/utils/conversationChecks.js";

export default {
  name: "ConversationsList",
  props: ["conversations", "selectedConversation"],
  emits: ["conversationSelected"],
  setup(props, context) {
    const filter = ref("");
    const selectedConversation = ref({});

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
      return props.conversations.filter((conversation) =>
        conversation.friendlyName
          .toLowerCase()
          .includes(filter.value.toLowerCase())
      );
    });

    return {
      filter,
      filteredConversations,
      selectConversation,
      isOlderThan24Hours,
    };
  },
};
</script>
