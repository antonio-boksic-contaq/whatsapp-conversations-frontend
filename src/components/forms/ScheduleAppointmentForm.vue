<template>
  <div class="py-6">
    <errors />
    <form
      :method="formStore.method"
      :id="formStore.id + 'FormId'"
      @submit.prevent="submit">
      <!-- <div>debug: {{ state }}</div>-->
      <div class="mt-0">
        <!-- <label for="idLista" class="font-medium block mb-2"> idLista </label> -->
        <InputText
          type="hidden"
          id="idLista"
          name="idLista"
          placeholder="Inserire idLista"
          v-model="state.idLista"
          class="w-full" />
      </div>

      <div class="mt-0">
        <label for="login" class="font-medium block mb-2">
          login (inserire 9999 se la chiamata può essere gestita da qualsiasi
          operatore)
        </label>
        <InputText
          type="text"
          id="login"
          name="login"
          placeholder="Inserire login"
          v-model="state.login"
          class="w-full" />
        <validation-error :vuelidate="v$.login" />
      </div>

      <!-- Selezione della data con mini calendario -->
      <div class="mt-4">
        <label for="dataAppuntamento" class="font-medium block mb-2"
          >Data Appuntamento</label
        >
        <InputText
          id="dataAppuntamento"
          name="dataAppuntamento"
          v-model="state.dataAppuntamento"
          type="date"
          dateFormat="dd/mm/yy"
          placeholder="Seleziona una data"
          class="w-full" />
        <validation-error :vuelidate="v$.dataAppuntamento" />
      </div>

      <!-- Selezione dell'orario -->
      <div class="mt-4">
        <label for="orarioAppuntamento" class="font-medium block mb-2"
          >Orario Appuntamento</label
        >

        <vue-select
          :value="state.orarioAppuntamento"
          label="orarioAppuntamento"
          :options="appointmentHours"
          :multiple="false"
          @selectedValueChange="changeData($event, 'orarioAppuntamento')"
          field="orarioAppuntamento"></vue-select>
        <validation-error :vuelidate="v$.orarioAppuntamento" />
      </div>

      <!-- <InputText
        v-if="formStore.action === 'update'"
        type="hidden"
        id="lead_status_id"
        name="lead_status_id"
        v-model="state.lead_status_id" /> -->

      <div class="clear-both mt-14">
        <Button
          label="Salva"
          class="p-button-text font-semibold block w-full mt-4 mx-auto uppercase text-3xl"
          :class="'p-button-' + formStore.color"
          @click="submit">
          <i class="pi pi-save mr-2 text-3xl"></i>
          Salva
        </Button>
      </div>
    </form>
  </div>
</template>
<script>
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { reactive } from "vue";
import { useApiStore } from "@/store/api";
import { useFormStore } from "@/store/forms";
import Errors from "@/components/shared/Errors.vue";
import ValidationError from "@/components/shared/ValidationError";
import VueSelect from "@/components/shared/VueSelect";

export default {
  name: "WhatsappConversationForm",
  components: { Errors, ValidationError, VueSelect },
  props: [],
  emits: ["emptyTable", "fetchData"],
  setup(props, context) {
    const apiStore = useApiStore();
    const formStore = useFormStore();

    const state = reactive({
      // lead_status_id: formStore.data != null ? formStore.data.id : null,
      idLista: formStore.data != null ? formStore.data.idLista : null,
      login: formStore.data != null ? formStore.data.login : null,
      dataAppuntamento:
        formStore.data != null ? formStore.data.dataAppuntamento : null,
      orarioAppuntamento:
        formStore.data != null ? formStore.data.orarioAppuntamento : null,
    });

    const changeData = (event, field) => {
      // console.log("stochiamandochangedata", event, field);
      state[field] = event;
    };

    const rules = {
      login: {
        required: helpers.withMessage("Questo campo è obbligatorio", required),
      },
      dataAppuntamento: {
        required: helpers.withMessage("Questo campo è obbligatorio", required),
      },
      orarioAppuntamento: {
        required: helpers.withMessage("Questo campo è obbligatorio", required),
      },
    };

    const v$ = useVuelidate(rules, state);

    const submit = async () => {
      const validate = await v$.value.$validate();
      if (!validate) return;
      //vediamo se sono dentro alla store
      if (formStore.action === "store")
        await apiStore.store(formStore.route, formStore.id + "FormId", false);
      // console.log("parte emit dal form");

      if (formStore.action === "update")
        await apiStore.update(formStore.route, formStore.id + "FormId");

      if (apiStore.success === true) {
        //console.log("qua ci entra????????????????????????????");
        //context.emit("emptyTable", true);
        apiStore.isLoading = true;
        //const response = await apiStore.fetch(props.url, apiStore.params);
        context.emit("fetchData", true);
        //context.emit("fetchData", response);
        formStore.empty();
      }
    };

    const generateAppointmentHours = () => {
      const hours = [];
      const startTime = 9 * 60; // (09:00)
      const endTime = 20 * 60; // (20:00)
      const interval = 15;

      for (let time = startTime; time <= endTime; time += interval) {
        const hoursPart = Math.floor(time / 60);
        const minutesPart = time % 60;
        const formattedTime = `${hoursPart
          .toString()
          .padStart(2, "0")}:${minutesPart.toString().padStart(2, "0")}`;
        hours.push({ orarioAppuntamento: formattedTime });
      }
      //console.log("hours", hours);
      return hours;
    };

    const appointmentHours = generateAppointmentHours();

    return { formStore, submit, state, v$, appointmentHours, changeData };
  },
};
</script>
