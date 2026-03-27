const secondaryWheelData = [
  {
    label: "CUP PROFILE",
    color: "#111111",
    children: [
      {
        label: "AROMA",
        color: "#1f1f1f",
        children: ["Intense (AM)", "Dense (AM)", "Rounded (AM)"],
      },
      {
        label: "TASTE",
        color: "#1a1a1a",
        children: [
          {
            label: "ACIDITY",
            color: "#252525",
            children: ["Mellow (AC)", "Light (AC)", "Balanced (AC)"],
          },
          {
            label: "SWEETNESS",
            color: "#2c2c2c",
            children: ["Hight (SW)", "Vanilla (SW)", "Candied (SW)"],
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
            children: ["Syrupy (TX)", "Creamy (TX)", "Velvety (TX)"],
          },
          {
            label: "BODY",
            color: "#3d3d3d",
            children: ["Heavy (BD)", "Thick (BD)", "Round (BD)"],
          },
        ],
      },
      {
        label: "AFTERTASTE",
        color: "#242424",
        children: [
          "Long (AF)",
          "Lingering (AF)",
          "Rounded (AF)",
          "Intense (AF)",
        ],
      },
    ],
  },
];

export default secondaryWheelData;