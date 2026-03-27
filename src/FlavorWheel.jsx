import { useEffect, useMemo, useState } from "react";
import secondaryWheelData from "./secondaryWheelData";

const wheelData = [
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

const wheelDataMap = {
  main: wheelData,
  secondary: secondaryWheelData,
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx, cy, rInner, rOuter, startAngle, endAngle) {
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

function textPoint(cx, cy, radius, angleDeg) {
  return polarToCartesian(cx, cy, radius, angleDeg);
}

function getTextRotation(angle) {
  let rotation = angle - 90;
  if (angle > 180) rotation += 180;
  return rotation;
}

function toggleInArray(array, value) {
  return array.includes(value)
    ? array.filter((item) => item !== value)
    : [...array, value];
}

function FlavorWheel({
  mainSelections,
  setMainSelections,
  secondarySelections,
  setSecondarySelections,
  onSecondaryChange,
}) {
  const [activeWheel, setActiveWheel] = useState("main");
  const [selectedMids, setSelectedMids] = useState([]);

  const currentWheel = wheelDataMap[activeWheel];
  const isSecondaryWheel = activeWheel === "secondary";

  const cx = 450;
  const cy = 450;

  const innerHole = 90;
  const ring1Inner = 90;
  const ring1Outer = 170;
  const ring2Inner = 170;
  const ring2Outer = 280;
  const ring3Inner = 280;
  const ring3Outer = 300;
  const outerLabelRadius = 315;

  const secondaryRotationOffset = -45;
  const secondaryStartAngle = -82 + secondaryRotationOffset;
  const secondaryEndAngle = 83 + secondaryRotationOffset;

  const secondaryRing1Inner = 105;
  const secondaryRing1Outer = 180;
  const secondaryRing2Inner = 184;
  const secondaryRing2Outer = 248;
  const secondaryRing3Inner = 252;
  const secondaryRing3Outer = 305;
  const secondaryOuterLabelRadius = 330;

  const secondaryRing1TextRadius =
    (secondaryRing1Inner + secondaryRing1Outer) / 2;
  const secondaryRing2TextRadius =
    (secondaryRing2Inner + secondaryRing2Outer) / 2;
  const secondaryRing3TextRadius =
    (secondaryRing3Inner + secondaryRing3Outer) / 2;

  const noOuterBlockLabels = useMemo(
    () =>
      new Set([
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
      ]),
    []
  );

  const totalLeaf = isSecondaryWheel
    ? 0
    : currentWheel.reduce(
        (sum, top) =>
          sum + top.children.reduce((s, mid) => s + mid.children.length, 0),
        0
      );

  const anglePerLeaf = isSecondaryWheel ? 0 : 360 / totalLeaf;

  let currentAngle = 0;
  const ring1Segments = [];
  const ring2Segments = [];
  const ring3Segments = [];

  if (!isSecondaryWheel) {
    currentWheel.forEach((top) => {
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
        const hasOuterBlock = !noOuterBlockLabels.has(mid.label);

        ring2Segments.push({
          label: mid.label,
          color: mid.color,
          start: midStart,
          end: midEnd,
          outerRadius: ring2Outer,
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
  }

  const secondaryTopSegments = [];
  const secondaryMidSegments = [];
  const secondaryInnerSegments = [];
  const secondaryLeafSegments = [];

  if (isSecondaryWheel && currentWheel.length > 0) {
    const top = currentWheel[0];
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
const secondaryLeafBlockSegments = useMemo(() => {
  const grouped = new Map();

  secondaryLeafSegments.forEach((seg) => {
    if (seg.parentMid === "AROMA" || seg.parentMid === "AFTERTASTE") return;

    const key = seg.parentInner || seg.parentMid;

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...seg,
        start: seg.start,
        end: seg.end,
      });
      return;
    }

    const existing = grouped.get(key);
    existing.start = Math.min(existing.start, seg.start);
    existing.end = Math.max(existing.end, seg.end);
  });

  return Array.from(grouped.values());
}, [secondaryLeafSegments]);
  useEffect(() => {
    if (isSecondaryWheel) {
      const validTopLabels = secondaryTopSegments.map((seg) => seg.label);
      const validMidLabels = secondaryMidSegments.map((seg) => seg.label);
      const validLeafLabels = secondaryLeafSegments.map((seg) => seg.label);

      setMainSelections((prev) =>
        prev.filter((label) => validTopLabels.includes(label))
      );
      setSelectedMids((prev) =>
        prev.filter((label) => validMidLabels.includes(label))
      );
      setSecondarySelections((prev) =>
        prev.filter((label) => validLeafLabels.includes(label))
      );
      return;
    }

    const validTopLabels = ring1Segments.map((seg) => seg.label);
    const validMidLabels = ring2Segments.map((seg) => seg.label);
    const validLeafLabels = [
      ...ring2Segments
        .filter((seg) => !seg.hasOuterBlock)
        .map((seg) => seg.label),
      ...ring3Segments.map((seg) => seg.label),
    ];

    setMainSelections((prev) =>
      prev.filter((label) => validTopLabels.includes(label))
    );
    setSelectedMids((prev) =>
      prev.filter((label) => validMidLabels.includes(label))
    );
    setSecondarySelections((prev) =>
      prev.filter((label) => validLeafLabels.includes(label))
    );
  }, [activeWheel, isSecondaryWheel, setMainSelections, setSecondarySelections]);

  useEffect(() => {
    if (activeWheel !== "main") return;

    const midsToRestore = ring2Segments
      .filter((seg) => {
        if (!mainSelections.includes(seg.parentTop)) return false;

        if (!seg.hasOuterBlock) {
          return secondarySelections.includes(seg.label);
        }

        return ring3Segments.some(
          (leaf) =>
            leaf.parentMid === seg.label &&
            secondarySelections.includes(leaf.label)
        );
      })
      .map((seg) => seg.label);

    setSelectedMids(midsToRestore);
  }, [activeWheel, mainSelections, secondarySelections]);

  const handleTopClick = (topLabel) => {
    if (isSecondaryWheel) {
      const next = mainSelections.includes(topLabel) ? [] : [topLabel];
      setMainSelections(next);

      if (next.length === 0) {
        setSelectedMids([]);
        setSecondarySelections([]);
      }
      return;
    }

    const willSelect = !mainSelections.includes(topLabel);
    const nextTops = toggleInArray(mainSelections, topLabel);

    if (willSelect) {
      setMainSelections(nextTops);
      return;
    }

    const midsToRemove = ring2Segments
      .filter((seg) => seg.parentTop === topLabel)
      .map((seg) => seg.label);

    const leavesToRemove = [
      ...ring2Segments
        .filter((seg) => seg.parentTop === topLabel && !seg.hasOuterBlock)
        .map((seg) => seg.label),
      ...ring3Segments
        .filter((seg) => seg.parentTop === topLabel)
        .map((seg) => seg.label),
    ];

    setMainSelections(nextTops);
    setSelectedMids((prev) => prev.filter((mid) => !midsToRemove.includes(mid)));
    setSecondarySelections((prev) =>
      prev.filter((leaf) => !leavesToRemove.includes(leaf))
    );
  };

  const handleMidClick = (seg) => {
    if (isSecondaryWheel) {
      if (!mainSelections.includes(seg.parentTop)) return;

      const willSelect = !selectedMids.includes(seg.label);
      const nextMids = toggleInArray(selectedMids, seg.label);
      setSelectedMids(nextMids);

      const leavesToToggle = secondaryLeafSegments
        .filter((leaf) => leaf.parentMid === seg.label)
        .map((leaf) => leaf.label);

      if (!willSelect) {
        setSecondarySelections((prev) =>
          prev.filter((leaf) => !leavesToToggle.includes(leaf))
        );
        return;
      }

      setSecondarySelections((prev) => {
        const next = [...prev];
        leavesToToggle.forEach((leaf) => {
          if (!next.includes(leaf)) next.push(leaf);
        });
        return next;
      });
      return;
    }

    if (!mainSelections.includes(seg.parentTop)) return;

    const willSelect = !selectedMids.includes(seg.label);
    const nextMids = toggleInArray(selectedMids, seg.label);
    setSelectedMids(nextMids);

    if (!willSelect) {
      const childLeaves = ring3Segments
        .filter((leaf) => leaf.parentMid === seg.label)
        .map((leaf) => leaf.label);

      setSecondarySelections((prev) =>
        prev.filter((leaf) => leaf !== seg.label && !childLeaves.includes(leaf))
      );
      return;
    }

    if (!seg.hasOuterBlock) {
      setSecondarySelections((prev) =>
        prev.includes(seg.label) ? prev : [...prev, seg.label]
      );
    }
  };

  const handleLeafClick = (seg) => {
    if (!mainSelections.includes(seg.parentTop)) return;

    if (isSecondaryWheel) {
      if (!selectedMids.includes(seg.parentMid)) return;
      setSecondarySelections((prev) => toggleInArray(prev, seg.label));
      return;
    }

    if (!selectedMids.includes(seg.parentMid)) return;
    setSecondarySelections((prev) => toggleInArray(prev, seg.label));
  };

  const hasSelectedTop = mainSelections.length > 0;
  const hasSelectedMid = selectedMids.length > 0;

  const getRing1Opacity = (label) => {
    if (!hasSelectedTop) return 1;
    return mainSelections.includes(label) ? 1 : 0.18;
  };

  const getRing2Opacity = (seg) => {
    if (!hasSelectedTop) return 0.12;
    if (!mainSelections.includes(seg.parentTop)) return 0.06;

    const midsInThisTop = ring2Segments.filter(
      (item) =>
        item.parentTop === seg.parentTop && selectedMids.includes(item.label)
    );

    if (midsInThisTop.length === 0) return 0.35;
    return selectedMids.includes(seg.label) ? 1 : 0.18;
  };

  const getRing3Opacity = (seg) => {
    if (!hasSelectedTop) return 0.06;
    if (!mainSelections.includes(seg.parentTop)) return 0.03;
    if (!hasSelectedMid) return 0.06;
    if (!selectedMids.includes(seg.parentMid)) return 0.06;

    const leavesInThisMid = secondarySelections.filter((label) =>
      ring3Segments.some(
        (item) => item.parentMid === seg.parentMid && item.label === label
      )
    );

    if (leavesInThisMid.length === 0) return 0.35;
    return secondarySelections.includes(seg.label) ? 1 : 0.18;
  };

  const getRing2TextColor = (seg) => {
    if (!hasSelectedTop) return "#9a9388";
    if (!mainSelections.includes(seg.parentTop)) return "#cfc8be";

    const midsInThisTop = ring2Segments.filter(
      (item) =>
        item.parentTop === seg.parentTop && selectedMids.includes(item.label)
    );

    if (midsInThisTop.length === 0) return "#ffffff";
    return selectedMids.includes(seg.label) ? "#ffffff" : "#d8d2ca";
  };

  const getRing3TextColor = (seg) => {
    if (!hasSelectedTop || !hasSelectedMid) return "#bdb6ad";
    if (!mainSelections.includes(seg.parentTop)) return "#d5cec4";
    if (!selectedMids.includes(seg.parentMid)) return "#d5cec4";

    const leavesInThisMid = secondarySelections.filter((label) =>
      ring3Segments.some(
        (item) => item.parentMid === seg.parentMid && item.label === label
      )
    );

    if (leavesInThisMid.length === 0) return "#5f5a52";
    return secondarySelections.includes(seg.label) ? "#111111" : "#aaa399";
  };

  const getSecondaryRing1Opacity = (label) => {
    if (!hasSelectedTop) return 1;
    return mainSelections.includes(label) ? 1 : 0.16;
  };

  const getSecondaryRing2Opacity = (seg) => {
    if (!hasSelectedTop) return 0.9;
    if (!mainSelections.includes(seg.parentTop)) return 0.08;
    if (!hasSelectedMid) return 0.45;
    return selectedMids.includes(seg.label) ? 1 : 0.18;
  };

  const getSecondaryRing3Opacity = (seg) => {
    if (!hasSelectedTop) return 0.92;
    if (!mainSelections.includes(seg.parentTop)) return 0.08;
    if (!hasSelectedMid) return 0.32;
    if (!selectedMids.includes(seg.parentMid)) return 0.08;

    const selectedInGroup = secondarySelections.filter((label) =>
      secondaryLeafSegments.some(
        (item) => item.parentMid === seg.parentMid && item.label === label
      )
    );

    if (selectedInGroup.length === 0) return 0.45;
    return secondarySelections.includes(seg.label) ? 1 : 0.18;
  };

  const getSecondaryRing2TextColor = (seg) => {
    if (!hasSelectedTop) return "#ffffff";
    if (!mainSelections.includes(seg.parentTop)) return "#cfc8be";
    return selectedMids.includes(seg.label) ? "#ffffff" : "#d8d2ca";
  };

  const getSecondaryRing3TextColor = (seg) => {
    if (!hasSelectedTop) return "#2f2a24";
    if (!mainSelections.includes(seg.parentTop)) return "#d5cec4";
    if (!hasSelectedMid) return "#2f2a24";
    if (!selectedMids.includes(seg.parentMid)) return "#d5cec4";
    return secondarySelections.includes(seg.label) ? "#111111" : "#8d867b";
  };

  const finalSelections = secondarySelections;

  const derivedSecondarySelections = {
    cupProfile: finalSelections.filter((label) =>
      [
        "CLEAN",
        "JUICY",
        "BRIGHT",
        "ROUND",
        "SYRUPY",
        "HEAVY",
        "INTENSE",
        "LINGERING",
        "CANDIED",
        "BALANCED",
        "CRISP",
        "SMOOTH",
        "LONG",
      ].includes(label)
    ),
  };

  useEffect(() => {
    if (!onSecondaryChange) return;

    onSecondaryChange({
      process: [],
      cupProfile: derivedSecondarySelections.cupProfile,
      activeWheel,
    });
  }, [derivedSecondarySelections.cupProfile, activeWheel, onSecondaryChange]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 900 900"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "#e7e3dd",
            borderRadius: 20,
          }}
        >
          {isSecondaryWheel ? (
            <>
{secondaryLeafBlockSegments.map((seg, index) => {
  if (seg.parentMid === "AROMA" || seg.parentMid === "AFTERTASTE") return null;

  const isClickable =
    mainSelections.includes(seg.parentTop) &&
    selectedMids.includes(seg.parentMid);
  const isSelected = secondarySelections.includes(seg.label);

  return (
    <path
      key={`sr4-${index}`}
      d={arcPath(
        cx,
        cy,
        secondaryRing3Inner,
        secondaryRing3Outer,
        seg.start,
        seg.end
      )}
      fill={seg.color}
      stroke="#e7e3dd"
      strokeWidth={isSelected ? "4" : "2.5"}
      opacity={getSecondaryRing3Opacity(seg)}
      onClick={isClickable ? () => handleLeafClick(seg) : undefined}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    />
  );
})}

              {secondaryInnerSegments.map((seg, index) => {
                const isClickable =
                  mainSelections.includes(seg.parentTop) &&
                  selectedMids.includes(seg.parentMid);

                return (
                  <path
                    key={`sr3-${index}`}
                    d={arcPath(
                      cx,
                      cy,
                      secondaryRing3Inner,
                      secondaryRing3Outer,
                      seg.start,
                      seg.end
                    )}
                    fill={seg.color}
                    stroke="#e7e3dd"
                    strokeWidth="3"
                    opacity={isClickable ? 0.95 : 0.15}
                    style={{ cursor: isClickable ? "pointer" : "default" }}
                  />
                );
              })}

              {secondaryMidSegments.map((seg, index) => {
                const isClickable = mainSelections.includes(seg.parentTop);
                const isSelected = selectedMids.includes(seg.label);

                return (
                  <path
                    key={`sr2-${index}`}
                    d={arcPath(
                      cx,
                      cy,
                      secondaryRing2Inner,
                      secondaryRing2Outer,
                      seg.start,
                      seg.end
                    )}
                    fill={seg.color}
                    stroke="#e7e3dd"
                    strokeWidth={isSelected ? "5" : "3"}
                    opacity={getSecondaryRing2Opacity(seg)}
                    onClick={isClickable ? () => handleMidClick(seg) : undefined}
                    style={{ cursor: isClickable ? "pointer" : "default" }}
                  />
                );
              })}

              {secondaryTopSegments.map((seg, index) => {
                const isSelected = mainSelections.includes(seg.label);

                return (
                  <path
                    key={`sr1-${index}`}
                    d={arcPath(
                      cx,
                      cy,
                      secondaryRing1Inner,
                      secondaryRing1Outer,
                      seg.start,
                      seg.end
                    )}
                    fill={seg.color}
                    stroke="#e7e3dd"
                    strokeWidth={isSelected ? "5" : "3"}
                    opacity={getSecondaryRing1Opacity(seg.label)}
                    onClick={() => handleTopClick(seg.label)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </>
          ) : (
            <>
              {ring3Segments.map((seg, index) => {
                const isClickable =
                  mainSelections.includes(seg.parentTop) &&
                  selectedMids.includes(seg.parentMid);
                const isSelected = secondarySelections.includes(seg.label);

                return (
                  <path
                    key={`r3-${index}`}
                    d={arcPath(cx, cy, ring3Inner, ring3Outer, seg.start, seg.end)}
                    fill={seg.color}
                    stroke="#e7e3dd"
                    strokeWidth={isSelected ? "4" : "2"}
                    opacity={getRing3Opacity(seg)}
                    onClick={isClickable ? () => handleLeafClick(seg) : undefined}
                    style={{ cursor: isClickable ? "pointer" : "default" }}
                  />
                );
              })}

              {ring2Segments.map((seg, index) => {
                const isClickable = mainSelections.includes(seg.parentTop);
                const isSelected = selectedMids.includes(seg.label);

                return (
                  <path
                    key={`r2-${index}`}
                    d={arcPath(
                      cx,
                      cy,
                      ring2Inner,
                      seg.outerRadius,
                      seg.start,
                      seg.end
                    )}
                    fill={seg.color}
                    stroke="#e7e3dd"
                    strokeWidth={isSelected ? "5" : "3"}
                    opacity={getRing2Opacity(seg)}
                    onClick={isClickable ? () => handleMidClick(seg) : undefined}
                    style={{ cursor: isClickable ? "pointer" : "default" }}
                  />
                );
              })}

              {ring1Segments.map((seg, index) => {
                const isSelected = mainSelections.includes(seg.label);

                return (
                  <path
                    key={`r1-${index}`}
                    d={arcPath(cx, cy, ring1Inner, ring1Outer, seg.start, seg.end)}
                    fill={seg.color}
                    stroke="#e7e3dd"
                    strokeWidth={isSelected ? "5" : "3"}
                    opacity={getRing1Opacity(seg.label)}
                    onClick={() => handleTopClick(seg.label)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </>
          )}

          <g
            onClick={() => {
              setActiveWheel((prev) => (prev === "main" ? "secondary" : "main"));
              setMainSelections([]);
              setSelectedMids([]);
              setSecondarySelections([]);
            }}
            style={{ cursor: "pointer" }}
          >
            <circle cx={cx} cy={cy} r={innerHole} fill="#f7f4ef" />
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#3d3935"
              fontSize="18"
              fontWeight="700"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                letterSpacing: "0.5px",
              }}
            >
              {activeWheel === "main" ? "MAIN" : "2ND"}
            </text>
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#8a8378"
              fontSize="9"
              fontWeight="700"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                letterSpacing: "1px",
              }}
            >
              CLICK TO SWITCH
            </text>
          </g>

          {activeWheel === "main" &&
            ring1Segments.map((seg, index) => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = textPoint(cx, cy, 130, midAngle);
              const lines = seg.label.split("\n");

              return (
                <g key={`t1-${index}`}>
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={pos.x}
                      y={pos.y + i * 14 - ((lines.length - 1) * 14) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={
                        hasSelectedTop && !mainSelections.includes(seg.label)
                          ? "#d8d2ca"
                          : "#ffffff"
                      }
                      fontSize="13"
                      fontWeight="700"
                      style={{
                        letterSpacing: "0.5px",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

          {activeWheel === "main" &&
            ring2Segments.map((seg, index) => {
              const midAngle = (seg.start + seg.end) / 2;
              const textRadius = (ring2Inner + seg.outerRadius) / 2;
              const pos = textPoint(cx, cy, textRadius, midAngle);
              const rotation = getTextRotation(midAngle);
              const lines = seg.label.split("\n");

              return (
                <g
                  key={`t2-${index}`}
                  transform={`rotate(${rotation} ${pos.x} ${pos.y})`}
                >
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={pos.x}
                      y={pos.y + i * 12 - ((lines.length - 1) * 12) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={getRing2TextColor(seg)}
                      fontSize="10"
                      fontWeight="700"
                      style={{
                        letterSpacing: "0.35px",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

          {activeWheel === "main" &&
            ring3Segments.map((seg, index) => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = textPoint(cx, cy, outerLabelRadius, midAngle);
              const isLeftSide = midAngle > 180;
              const rotation = isLeftSide ? midAngle + 90 : midAngle - 90;
              const anchor = isLeftSide ? "end" : "start";

              return (
                <text
                  key={`t3-${index}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  transform={`rotate(${rotation} ${pos.x} ${pos.y})`}
                  fill={getRing3TextColor(seg)}
                  fontSize="10"
                  fontWeight="700"
                  style={{
                    letterSpacing: "0.2px",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {seg.label}
                </text>
              );
            })}

          {isSecondaryWheel &&
            secondaryTopSegments.map((seg, index) => {
              const midAngle = (seg.start + seg.end) / 3;
              const pos = textPoint(cx, cy, secondaryRing1TextRadius, midAngle);
              const rotation = getTextRotation(midAngle);
              const lines = seg.label.split("\n");

              return (
                <g
                  key={`st1-${index}`}
                  
                >
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={pos.x}
                      y={pos.y + i * 15 - ((lines.length - 1) * 15) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="15"
                      fontWeight="700"
                      style={{
                        letterSpacing: "0.4px",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

          {isSecondaryWheel &&
            secondaryMidSegments.map((seg, index) => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = textPoint(cx, cy, secondaryRing2TextRadius, midAngle);
              const rotation = getTextRotation(midAngle);
              const lines = seg.label.split("\n");

              return (
                <g
                  key={`st2-${index}`}
                  
                >
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={pos.x}
                      y={pos.y + i * 12 - ((lines.length - 1) * 12) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={getSecondaryRing2TextColor(seg)}
                      fontSize="11"
                      fontWeight="700"
                      style={{
                        letterSpacing: "0.3px",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

          {isSecondaryWheel &&
            secondaryInnerSegments.map((seg, index) => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = textPoint(cx, cy, secondaryRing3TextRadius, midAngle);
              const rotation = getTextRotation(midAngle);

              return (
                <g
                  key={`st3-${index}`}
                  
                >
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="700"
                    style={{
                      letterSpacing: "0.3px",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}

          {isSecondaryWheel &&
            secondaryLeafSegments.map((seg, index) => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = textPoint(cx, cy, secondaryOuterLabelRadius, midAngle);
              const isLeftSide = midAngle > 180 || midAngle < 0;
              const rotation = isLeftSide ? midAngle + 90 : midAngle - 90;
              const anchor = isLeftSide ? "end" : "start";

              return (
                <text
                  key={`st4-${index}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  transform={`rotate(${rotation} ${pos.x} ${pos.y})`}
                  fill={getSecondaryRing3TextColor(seg)}
                  fontSize="10"
                  fontWeight="700"
                  style={{
                    letterSpacing: "0.2px",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {seg.label}
                </text>
              );
            })}
        </svg>
      </div>

      <div
        style={{
          width: "100%",
          background: "#f7f4ef",
          border: "1px solid #ddd6ca",
          borderRadius: 16,
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: 16,
            color: "#3d3935",
          }}
        >
          {activeWheel === "main" ? "Selected Flavors" : "Selected Notes"}
        </h3>

        {activeWheel === "main" ? (
          finalSelections.length === 0 ? (
            <p style={{ margin: 0, color: "#7a746b", fontSize: 14 }}>
              Nothing selected yet
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {finalSelections.map((flavor) => (
                <div
                  key={flavor}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#e7e3dd",
                    color: "#3d3935",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {flavor}
                </div>
              ))}
            </div>
          )
        ) : derivedSecondarySelections.cupProfile.length === 0 ? (
          <p style={{ margin: 0, color: "#7a746b", fontSize: 14 }}>
            Nothing selected yet
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              color: "#3d3935",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <div>
              <strong>Cup Profile:</strong>{" "}
              {derivedSecondarySelections.cupProfile.join(", ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlavorWheel;
