import secondaryWheelData from "./secondaryWheelData";

export const wheelData = [
  {
    label: "FRUITY",
    color: "#e53935",
    children: [
      {
        label: "BERRY",
        color: "#d81b60",
        children: ["BLACKBERRY", "RASPBERRY", "BLUEBERRY", "STRAWBERRY"],
      },
      {
        label: "DRIED FRUIT",
        color: "#8e24aa",
        children: ["RAISIN", "PRUNE"],
      },
      {
        label: "OTHER FRUIT",
        color: "#f4511e",
        children: [
          "COCONUT",
          "CHERRY",
          "POMEGRANATE",
          "PINEAPPLE",
          "GRAPE",
          "APPLE",
          "PEACH",
          "PEAR",
        ],
      },
      {
        label: "CITRUS FRUIT",
        color: "#ffb300",
        children: ["GRAPEFRUIT", "ORANGE", "LEMON", "LIME"],
      },
    ],
  },
  {
    label: "SOUR/\nFERMENTED",
    color: "#d4d700",
    children: [
      {
        label: "SOUR",
        color: "#cddc39",
        children: [
          "SOUR AROMATICS",
          "ACETIC ACID",
          "BUTYRIC ACID",
          "ISOVALERIC ACID",
          "CITRIC ACID",
          "MALIC ACID",
        ],
      },
      {
        label: "ALCOHOL/\nFERMENTED",
        color: "#9e9d24",
        children: ["WINEY", "WHISKEY", "FERMENTED", "OVERRIPE"],
      },
    ],
  },
  {
    label: "GREEN/\nVEGETATIVE",
    color: "#43a047",
    children: [
      {
        label: "OLIVE OIL",
        color: "#7cb342",
        children: ["OLIVE OIL"],
      },
      {
        label: "RAW",
        color: "#8bc34a",
        children: ["RAW"],
      },
      {
        label: "GREEN/\nVEGETATIVE",
        color: "#32b44a",
        children: [
          "UNDER-RIPE",
          "PEAPOD",
          "FRESH",
          "DARK GREEN",
          "VEGETATIVE",
          "HAY-LIKE",
          "HERB-LIKE",
        ],
      },
      {
        label: "BEANY",
        color: "#00a152",
        children: ["BEANY"],
      },
    ],
  },
  {
    label: "OTHER",
    color: "#26a6d1",
    children: [
      {
        label: "CHEMICAL",
        color: "#4fc3f7",
        children: [
          "RUBBER",
          "SKUNKY",
          "PETROLEUM",
          "MEDICINAL",
          "SALTY",
          "BITTER",
          "CHEMICAL",
        ],
      },
      {
        label: "PAPERY/\nMUSTY",
        color: "#90a4ae",
        children: [
          "PAPERY",
          "CARDBOARD",
          "WOODY",
          "MOLDY/DAMP",
          "MUSTY/DUSTY",
          "MUSTY/EARTHY",
          "ANIMALIC",
          "MEATY BROTHY",
          "PHENOLIC",
        ],
      },
      {
        label: "STALE",
        color: "#b0bec5",
        children: ["STALE"],
      },
    ],
  },
  {
    label: "ROASTED",
    color: "#c62828",
    children: [
      {
        label: "PIPE TOBACCO",
        color: "#8d6e63",
        children: ["PIPE TOBACCO"],
      },
      {
        label: "TOBACCO",
        color: "#a1887f",
        children: ["TOBACCO"],
      },
      {
        label: "BURNT",
        color: "#b97c42",
        children: ["ACRID", "ASHY", "SMOKY", "BROWN ROAST"],
      },
      {
        label: "CEREAL",
        color: "#d8c72a",
        children: ["GRAIN", "MALT"],
      },
    ],
  },
  {
    label: "SPICES",
    color: "#ad1457",
    children: [
      {
        label: "PUNGENT",
        color: "#c2185b",
        children: ["PUNGENT"],
      },
      {
        label: "PEPPER",
        color: "#e53935",
        children: ["PEPPER"],
      },
      {
        label: "BROWN SPICE",
        color: "#8e2430",
        children: ["ANISE", "NUTMEG", "CINNAMON", "CLOVE"],
      },
    ],
  },
  {
    label: "NUTTY/\nCOCOA",
    color: "#8d6e63",
    children: [
      {
        label: "NUTTY",
        color: "#bc8f8f",
        children: ["PEANUTS", "HAZELNUT", "ALMOND"],
      },
      {
        label: "COCOA",
        color: "#c57b1e",
        children: ["CHOCOLATE", "DARK CHOCOLATE"],
      },
    ],
  },
  {
    label: "SWEET",
    color: "#ff6f00",
    children: [
      {
        label: "BROWN SUGAR",
        color: "#d08159",
        children: ["MOLASSES", "MAPLE SYRUP", "CARAMELIZED", "HONEY"],
      },
      {
        label: "VANILLA",
        color: "#f4c28b",
        children: ["VANILLA"],
      },
      {
        label: "VANILLIN",
        color: "#ffab91",
        children: ["VANILLIN"],
      },
      {
        label: "OVERALL SWEET",
        color: "#ef9a9a",
        children: ["OVERALL SWEET"],
      },
      {
        label: "SWEET AROMATICS",
        color: "#d97aa6",
        children: ["SWEET AROMATICS"],
      },
    ],
  },
  {
    label: "FLORAL",
    color: "#ff00b8",
    children: [
      {
        label: "BLACK TEA",
        color: "#212121",
        children: ["BLACK TEA"],
      },
      {
        label: "FLORAL",
        color: "#ec407a",
        children: ["CHAMOMILE", "ROSE", "JASMINE"],
      },
    ],
  },
];

export const wheelConstants = {
  cx: 450,
  cy: 450,
  innerHole: 90,
  ring1Inner: 90,
  ring1Outer: 170,
  ring2Inner: 170,
  ring2Outer: 280,
  ring3Inner: 280,
  ring3Outer: 300,
  outerLabelRadius: 315,

  secondaryRotationOffset: -45,
  secondaryRing1Inner: 90,
  secondaryRing1Outer: 180,
  secondaryRing2Inner: 184,
  secondaryRing2Outer: 248,
  secondaryRing3Inner: 252,
  secondaryRing3Outer: 305,
  secondaryOuterLabelRadius: 330,
};

export function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function arcPath(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const innerEnd = polarToCartesian(cx, cy, rInner, endAngle);
  const innerStart = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return `
    M ${outerStart.x} ${outerStart.y}
    A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}
    L ${innerEnd.x} ${innerEnd.y}
    A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}
    Z
  `;
}

export function buildMainWheelSegments() {
  const noOuterBlockLabels = new Set([
    "BLACK TEA",
    "OLIVE OIL",
    "RAW",
    "BEANY",
    "PIPE TOBACCO",
    "TOBACCO",
    "PUNGENT",
    "PEPPER",
    "VANILLA",
    "VANILLIN",
    "OVERALL SWEET",
    "SWEET AROMATICS",
    "STALE",
  ]);

  const totalLeaf = wheelData.reduce(
    (sum, top) =>
      sum + top.children.reduce((s, mid) => s + mid.children.length, 0),
    0
  );

  const anglePerLeaf = 360 / totalLeaf;

  let currentAngle = 0;
  const ring1Segments = [];
  const ring2Segments = [];
  const ring3Segments = [];

  wheelData.forEach((top) => {
    const topLeafCount = top.children.reduce(
      (sum, mid) => sum + mid.children.length,
      0
    );

    const topSpan = topLeafCount * anglePerLeaf;
    const topStart = currentAngle;
    const topEnd = currentAngle + topSpan;

    ring1Segments.push({
      label: top.label,
      color: top.color,
      start: topStart,
      end: topEnd,
    });

    let childAngle = topStart;

    top.children.forEach((mid) => {
      const midChildrenCount = mid.children.length;
      const midSpan = midChildrenCount * anglePerLeaf;
      const midStart = childAngle;
      const midEnd = childAngle + midSpan;
      const hasOuterBlock = mid.children.length > 1;

      ring2Segments.push({
        label: mid.label,
        color: mid.color,
        start: midStart,
        end: midEnd,
        outerRadius: wheelConstants.ring2Outer,
        parentTop: top.label,
        hasOuterBlock,
      });

      const leafSpan = midSpan / midChildrenCount;
      let leafAngle = midStart;

      mid.children.forEach((leaf) => {
        const leafStart = leafAngle;
        const leafEnd = leafAngle + leafSpan;

        if (hasOuterBlock) {
          ring3Segments.push({
            id: `${top.label}-${mid.label}-${leaf}`,
            label: leaf,
            color: mid.color,
            start: leafStart,
            end: leafEnd,
            parentTop: top.label,
            parentMid: mid.label,
          });
        }

        leafAngle += leafSpan;
      });

      childAngle += midSpan;
    });

    currentAngle += topSpan;
  });

  return { ring1Segments, ring2Segments, ring3Segments };
}

export function buildSecondaryWheelSegments() {
  const secondaryStartAngle = -82 + wheelConstants.secondaryRotationOffset;
  const secondaryEndAngle = 83 + wheelConstants.secondaryRotationOffset;

  const secondaryTopSegments = [];
  const secondaryMidSegments = [];
  const secondaryInnerSegments = [];
  const secondaryLeafSegments = [];

  if (secondaryWheelData.length > 0) {
    const top = secondaryWheelData[0];
    const mids = Array.isArray(top.children) ? top.children : [];
    const totalSpan = secondaryEndAngle - secondaryStartAngle;
    const midAngle = mids.length > 0 ? totalSpan / mids.length : 0;

    secondaryTopSegments.push({
      label: top.label,
      color: top.color,
      start: secondaryStartAngle,
      end: secondaryEndAngle,
    });

    mids.forEach((mid, midIndex) => {
      const midStart = secondaryStartAngle + midAngle * midIndex;
      const midEnd = midStart + midAngle;
      const midChildren = Array.isArray(mid.children) ? mid.children : [];

      const hasInnerRing =
        midChildren.length > 0 &&
        typeof midChildren[0] === "object" &&
        midChildren[0] !== null &&
        "label" in midChildren[0];

      secondaryMidSegments.push({
        label: mid.label,
        color: mid.color,
        start: midStart,
        end: midEnd,
        parentTop: top.label,
        hasInnerRing,
      });

      if (hasInnerRing) {
        const innerAngle = (midEnd - midStart) / midChildren.length;

        midChildren.forEach((inner, innerIndex) => {
          const innerStart = midStart + innerAngle * innerIndex;
          const innerEnd = innerStart + innerAngle;

          secondaryInnerSegments.push({
            label: inner.label,
            color: inner.color || mid.color,
            start: innerStart,
            end: innerEnd,
            parentTop: top.label,
            parentMid: mid.label,
          });

          const leaves =
            Array.isArray(inner.children) && inner.children.length > 0
              ? inner.children
              : [inner.label];

          const leafAngle = (innerEnd - innerStart) / leaves.length;

          leaves.forEach((leaf, leafIndex) => {
            const leafStart = innerStart + leafAngle * leafIndex;
            const leafEnd = leafStart + leafAngle;

            secondaryLeafSegments.push({
              id: `${mid.label}-${inner.label}-${leaf}`,
              groupKey: `${mid.label}-${inner.label}`,
              label: leaf,
              color: inner.color || mid.color,
              start: leafStart,
              end: leafEnd,
              parentTop: top.label,
              parentMid: mid.label,
              parentInner: inner.label,
            });
          });
        });
      } else {
        const leaves = midChildren.length > 0 ? midChildren : [mid.label];
        const leafAngle = (midEnd - midStart) / leaves.length;

        leaves.forEach((leaf, leafIndex) => {
          const leafStart = midStart + leafAngle * leafIndex;
          const leafEnd = leafStart + leafAngle;

          secondaryLeafSegments.push({
            id: `${mid.label}-none-${leaf}`,
            groupKey: `${mid.label}-none`,
            label: leaf,
            color: mid.color,
            start: leafStart,
            end: leafEnd,
            parentTop: top.label,
            parentMid: mid.label,
            parentInner: null,
          });
        });
      }
    });
  }

  return {
    secondaryTopSegments,
    secondaryMidSegments,
    secondaryInnerSegments,
    secondaryLeafSegments,
  };
}