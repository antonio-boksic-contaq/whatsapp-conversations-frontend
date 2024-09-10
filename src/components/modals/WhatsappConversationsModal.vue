<template>
  <Modal size="modal-xl">
    <template #content>
      <whatsapp-conversations-form
        :url="url"
        v-if="formStore.formToShow != null"
        @emptyTable="emptyTable"
        @fetchData="fetchData($event)" />
    </template>
  </Modal>
</template>
<script>
import Modal from "@/components/shared/Modal.vue";
import WhatsappConversationsForm from "@/components/forms/WhatsappConversationsForm.vue";
import { useFormStore } from "@/store/forms";

export default {
  name: "WhatsappConversationsModal",
  props: ["url"],
  emits: ["emptyTable", "fetchData"],
  components: {
    WhatsappConversationsForm,
    Modal,
  },
  setup(props, context) {
    const formStore = useFormStore();

    const emptyTable = () => {
      context.emit("emptyTable", true);
    };

    const fetchData = (event) => {
      context.emit("fetchData", event);
    };

    return { emptyTable, fetchData, formStore };
  },
};
</script>
