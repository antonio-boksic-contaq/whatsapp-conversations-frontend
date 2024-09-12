<template>
  <Modal size="modal-xl">
    <template #content>
      <schedule-appointment-form
        v-if="formStore.formToShow === 'appuntamento'"
        @emptyTable="emptyTable"
        @fetchData="fetchData($event)" />
    </template>
  </Modal>
</template>
<script>
import Modal from "@/components/shared/Modal.vue";
import scheduleAppointmentForm from "@/components/forms/ScheduleAppointmentForm.vue";
import { useFormStore } from "@/store/forms";

export default {
  name: "WhatsappConversationsModal",
  props: [],
  emits: ["emptyTable", "fetchData"],
  components: {
    scheduleAppointmentForm,
    Modal,
  },
  setup(props, context) {
    const formStore = useFormStore();

    const emptyTable = () => {
      context.emit("emptyTable", true);
    };

    const fetchData = (event) => {
      console.log("emit nella modale");
      context.emit("fetchData", event);
    };

    return { emptyTable, fetchData, formStore };
  },
};
</script>
