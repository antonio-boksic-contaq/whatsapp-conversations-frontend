<template>
  <Modal size="modal-xl">
    <template #content>
      <user-form
        :url="url"
        :candidateInfo="candidateInfo"
        v-if="formStore.formToShow === 'user'"
        @emptyTable="emptyTable"
        @fetchData="fetchData($event)" />
    </template>
  </Modal>
</template>
<script>
import Modal from "@/components/shared/Modal.vue";
import UserForm from "@/components/forms/UserForm.vue";
import { useFormStore } from "@/store/forms";

export default {
  name: "UserModal",
  props: ["candidateInfo", "url"],
  emits: ["emptyTable", "fetchData"],
  components: {
    UserForm,
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
