const secondaryWheelData = [
  {
    label: "CUP PROFILE",
    color: "#111111",
    children: [
      {
        label: "AROMA",
        color: "#1f1f1f",
        children: ["Intense (I)", "Dense (Q)", "Rounded (Q)"],
      },
      {
        label: "TASTE",
        color: "#1a1a1a",
        children: [
          {
            label: "ACIDITY",
            color: "#252525",
            children: ["Mellow (Q)", "Light (I)", "Balanced (I)"],
          },
          {
            label: "SWEETNESS",
            color: "#2c2c2c",
            children: ["Hight (I)", "Vanilla (Q)", "Candied (Q)"],
          },
        ],
      },
      {
        label: "MOUTHFEEL",
        color: "#2a2a2a",
        children: [
          {
            label: "TEXTURE",
            color: "#353535",
            children: ["Syrupy (I)", "Creamy (Q)", "Velvety (Q)"],
          },
          {
            label: "BODY",
            color: "#3d3d3d",
            children: ["Heavy (W)", "Thick (Q)", "Round (Q)"],
          },
        ],
      },
      {
        label: "AFTERTASTE",
        color: "#242424",
        children: [
          "Long (L)",
          "Lingering (L)",
          "Rounded (Q)",
          "Intense (Q)",
        ],
      },
    ],
  },
];

export default secondaryWheelData;