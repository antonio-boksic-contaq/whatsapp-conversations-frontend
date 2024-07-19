<template>
  <full-calendar :options="calendarOptions" :key="calendarKey" />
  <campaign-modal
    :url="campaignUrl"
    :item="item"
    @fetchData="refreshCalendar" />
</template>
<script>
import { useApiStore } from "@/store/api";
import { useLoadingStore } from "@/store/loadings";
import { useModalStore } from "@/store/modals";
import { ref, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import itLocale from "@fullcalendar/core/locales/it";
import interactionPlugin from "@fullcalendar/interaction";
import CampaignModal from "@/components/modals/CampaignModal";

export default {
  components: {
    CampaignModal,
    FullCalendar,
  },
  props: ["filters"],
  setup(props) {
    const modalStore = useModalStore();
    const apiStore = useApiStore();
    const loadingStore = useLoadingStore();
    const url = process.env.VUE_APP_API_URL + "/campaigns/calendar";
    const campaignUrl = process.env.VUE_APP_API_URL + "/campaigns";
    const item = ref(null);
    const calendarKey = ref(0);

    const itemAction = async (el) => {
      loadingStore.load();
      modalStore.detailId = el.event.id;
      modalStore.size = "modal-xl";
      modalStore.open("", "detail");
      modalStore.icon = "pi-search";
      modalStore.title = "Dettaglio elemento";
      modalStore.modalToShow = "item detail";
      loadingStore.stop();
    };

    const refreshCalendar = () => {
      calendarKey.value += 1;
    };

    watch(
      () => props.filters,
      () => (calendarKey.value += 1)
    );

    const calendarOptions = {
      locale: itLocale,
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: "timeGridWeek",
      eventClick: (el) => itemAction(el),
      headerToolbar: {
        start: "timeGridDay,timeGridWeek,dayGridMonth",
        center: "title",
        end: "prev,next",
      },
      buttonText: {
        today: "Oggi",
        month: "Mese",
        week: "Settimana",
        day: "Giorno",
      },
      allDaySlot: false,
      contentHeight: 600,
      slotMinTime: "08:00:00",
      slotMaxTime: "20:00:00",
      events: async (info) => {
        const { startStr, endStr } = info;
        let urlWithParams = url + "?start=" + startStr + "&end=" + endStr;

        if (props.filters !== null)
          urlWithParams = urlWithParams + "&customer_id=" + props.filters;

        return await apiStore.fetch(urlWithParams);
      },
    };

    return {
      calendarKey,
      calendarOptions,
      campaignUrl,
      item,
      refreshCalendar,
    };
  },
};
</script>
