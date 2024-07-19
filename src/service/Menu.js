const Menu = [
  {
    label: "Home",
    roles: ["System Admin"],
    data: [
      {
        label: "Dashboard",
        icon: ["far", "user"],
        to: "/dashboard",
        roles: ["System Admin"],
      },
      {
        label: "Calendario",
        icon: ["far", "calendar"],
        to: "/calendario-startup",
        roles: ["System Admin"],
      },
    ],
  },
  {
    label: "Campagne",
    roles: ["System Admin"],
    data: [
      {
        label: "Campagne",
        icon: ["fas", "headset"],
        to: "/campagne",
        roles: ["System Admin"],
      },
      {
        label: "Tipo campagna",
        icon: ["fas", "sliders"],
        to: "/tipo-campagna",
        roles: ["System Admin"],
      },
      {
        label: "Clienti",
        icon: ["fas", "user-tie"],
        to: "/clienti",
        roles: ["System Admin"],
      },
      {
        label: "Task",
        icon: ["fas", "list-check"],
        to: "/task",
        roles: ["System Admin"],
      },
      {
        label: "Utenti",
        icon: ["fas", "user"],
        to: "/utenti",
        roles: ["System Admin"],
      },
    ],
  },
];

export default Menu;
