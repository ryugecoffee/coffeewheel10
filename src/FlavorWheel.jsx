import { useEffect, useMemo, useState } from "react";
import {
  wheelConstants,
  polarToCartesian,
  arcPath,
  buildMainWheelSegments,
  wheelData,
} from "./wheelGeometry";
import secondaryWheelData from "./secondaryWheelData";

const wheelDataMap = {
  main: wheelData,
  secondary: secondaryWheelData,
};

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

function arraysEqual(a = [], b = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function FlavorWheel({
  mainSelections,
  setMainSelections,
  secondarySelections,
  setSecondarySelections,
  cupProfileSelections = [],
  setCupProfileSelections,
  onSecondaryChange,
}) {
  const [activeWheel, setActiveWheel] = useState("main");
  const [mainSelectedMids, setMainSelectedMids] = useState([]);
  const [secondarySelectedMids, setSecondarySelectedMids] = useState([]);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

useEffect(() => {
  const handleResize = () => setScreenSize(window.innerWidth);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

const wheelMaxWidth =
  screenSize < 500 ? "100%" :
  screenSize < 900 ? "90%" :
  "900px";

  const isSecondaryWheel = activeWheel === "secondary";

  const selectedMids = isSecondaryWheel
    ? secondarySelectedMids
    : mainSelectedMids;

  const setSelectedMids = isSecondaryWheel
    ? setSecondarySelectedMids
    : setMainSelectedMids;

  const currentWheel = wheelDataMap[activeWheel];

  const {
    cx,
    cy,
    innerHole,
    ring1Inner,
    ring1Outer,
    ring2Inner,
    ring2Outer,
    ring3Inner,
    ring3Outer,
    outerLabelRadius,
    secondaryRing1Inner,
    secondaryRing1Outer,
    secondaryRing2Inner,
    secondaryRing2Outer,
    secondaryRing3Inner,
    secondaryRing3Outer,
    secondaryOuterLabelRadius,
  } = wheelConstants;

  const secondaryStartAngle = -82 + wheelConstants.secondaryRotationOffset;
  const secondaryEndAngle = 83 + wheelConstants.secondaryRotationOffset;

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

  const { ring1Segments, ring2Segments, ring3Segments } = useMemo(() => {
    if (isSecondaryWheel) {
      return {
        ring1Segments: [],
        ring2Segments: [],
        ring3Segments: [],
      };
    }

    return buildMainWheelSegments();
  }, [isSecondaryWheel, currentWheel, noOuterBlockLabels, ring2Outer]);

      const {
    secondaryTopSegments,
    secondaryMidSegments,
    secondaryInnerSegments,
    secondaryLeafSegments,
  } = useMemo(() => {
    const secondaryTopSegments = [];
    const secondaryMidSegments = [];
    const secondaryInnerSegments = [];
    const secondaryLeafSegments = [];

    const secondaryWheel = secondaryWheelData;

    if (secondaryWheel.length > 0) {
      const top = secondaryWheel[0];
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
  }, [secondaryStartAngle, secondaryEndAngle]);
  const secondaryWheelSelections = useMemo(() => {
    if (!Array.isArray(cupProfileSelections)) return [];

    return secondaryLeafSegments
      .filter((leaf) => cupProfileSelections.includes(leaf.label))
      .map((leaf) => leaf.id);
  }, [cupProfileSelections, secondaryLeafSegments]);

  const secondaryLeafBlockSegments = useMemo(() => {
    const grouped = new Map();

    secondaryLeafSegments.forEach((seg) => {
      if (seg.parentMid === "AROMA" || seg.parentMid === "AFTERTASTE") return;

      const key = seg.groupKey || seg.parentInner || seg.parentMid;

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
  if (!Array.isArray(cupProfileSelections)) return;
  if (secondaryLeafSegments.length === 0) return;

  const matchedLeaves = secondaryLeafSegments.filter((leaf) =>
    cupProfileSelections.includes(leaf.label)
  );

  const nextSecondaryMids = Array.from(
    new Set(
      matchedLeaves.flatMap((leaf) =>
        leaf.parentInner
          ? [leaf.parentMid, leaf.parentInner]
          : [leaf.parentMid]
      )
    )
  );

  setSecondarySelectedMids(nextSecondaryMids);
}, [cupProfileSelections, secondaryLeafSegments]);

  useEffect(() => {
    if (!Array.isArray(mainSelections) || !Array.isArray(secondarySelections))
      return;
    if (ring2Segments.length === 0) return;

    const nextMainMids = ring2Segments
      .filter((mid) => {
        if (!mainSelections.includes(mid.parentTop)) return false;

        if (!mid.hasOuterBlock) {
          return secondarySelections.includes(mid.label);
        }

        return ring3Segments.some(
          (leaf) =>
            leaf.parentMid === mid.label &&
            secondarySelections.includes(leaf.label)
        );
      })
      .map((mid) => mid.label);

    setMainSelectedMids((prev) =>
      arraysEqual(prev, nextMainMids) ? prev : nextMainMids
    );
  }, [mainSelections, secondarySelections, ring2Segments, ring3Segments]);

  useEffect(() => {
    if (!isSecondaryWheel) return;
    if (!onSecondaryChange) return;

    onSecondaryChange({
      cupProfileSelections,
      cupProfile: cupProfileSelections,
      mainSelections,
      secondarySelections,
      activeWheel,
    });
  }, [
    isSecondaryWheel,
    onSecondaryChange,
    cupProfileSelections,
    mainSelections,
    secondarySelections,
    activeWheel,
  ]);

  const handleTopClick = (topLabel) => {
    if (isSecondaryWheel) {
      setActiveWheel("main");
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

    setMainSelectedMids((prev) =>
      prev.filter((mid) => !midsToRemove.includes(mid))
    );

    setSecondarySelections((prev) =>
      prev.filter((leaf) => !leavesToRemove.includes(leaf))
    );
  };

 const handleInnerClick = (seg) => {
  if (!isSecondaryWheel) return;

  setSelectedMids((prev) => {
    const siblingInnerLabels = secondaryInnerSegments
      .filter((item) => item.parentMid === seg.parentMid)
      .map((item) => item.label);

    const next = prev.filter((v) => !siblingInnerLabels.includes(v));

    return [...new Set([...next, seg.parentMid, seg.label])];
  });

 const handleInnerClick = (seg) => {
  if (!isSecondaryWheel) return;

  setSelectedMids((prev) => {
    const siblingInnerLabels = secondaryInnerSegments
      .filter((item) => item.parentMid === seg.parentMid)
      .map((item) => item.label);

    const next = prev.filter((v) => !siblingInnerLabels.includes(v));

    return [...new Set([...next, seg.parentMid, seg.label])];
  });
};
};

  const handleMidClick = (seg) => {
    if (isSecondaryWheel) {
      setSelectedMids((prev) => {
        const isAlreadySelected = prev.includes(seg.label);

        let next;

        if (isAlreadySelected) {
          next = prev.filter((v) => v !== seg.label);
        } else {
          next = [...prev, seg.label];
        }

        const relatedInner = secondaryInnerSegments
          .filter((inner) => inner.parentMid === seg.label)
          .map((inner) => inner.label);

        return [...new Set([...next, ...relatedInner])];
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

  const handleSecondaryLeafBlockClick = (seg) => {
    if (!isSecondaryWheel) return;

    const firstLeaf = secondaryLeafSegments.find((leaf) => {
      if (seg.parentInner) return leaf.parentInner === seg.parentInner;
      return leaf.parentMid === seg.parentMid;
    });

    if (firstLeaf) {
      handleLeafClick(firstLeaf);
    }
  };

  const handleLeafClick = (seg) => {
    if (isSecondaryWheel) {
      const canClick = seg.parentInner
        ? selectedMids.includes(seg.parentInner)
        : selectedMids.includes(seg.parentMid);

      if (!canClick) return;

      const nextIds = secondaryWheelSelections.filter((id) => {
        const item = secondaryLeafSegments.find((leaf) => leaf.id === id);
        return item ? item.groupKey !== seg.groupKey : false;
      });

      const alreadySelected = secondaryWheelSelections.includes(seg.id);
      const resultIds = alreadySelected ? nextIds : [...nextIds, seg.id];

      const resultLabels = resultIds
        .map((id) => {
          const item = secondaryLeafSegments.find((leaf) => leaf.id === id);
          return item ? item.label : null;
        })
        .filter(Boolean);

      if (typeof setCupProfileSelections === "function") {
        setCupProfileSelections(resultLabels);
      }

      return;
    }

    if (!mainSelections.includes(seg.parentTop)) return;
    if (!selectedMids.includes(seg.parentMid)) return;

    setSelectedMids((prev) =>
      prev.includes(seg.parentMid) ? prev : [...prev, seg.parentMid]
    );

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

  const getSecondaryRing1Opacity = () => 1;

  const getSecondaryRing2Opacity = (seg) => {
    if (!hasSelectedMid) return 0.45;
    return selectedMids.includes(seg.label) ? 1 : 0.18;
  };

  const getSecondaryRing2TextColor = (seg) => {
    if (selectedMids.length === 0) return "#ffffff";
    return selectedMids.includes(seg.label) ? "#ffffff" : "#d8d2ca";
  };

  const getSecondaryRing3TextColor = (seg) => {
    if (!hasSelectedMid) return "#2f2a24";
    if (!selectedMids.includes(seg.parentMid)) return "#d5cec4";
    return secondaryWheelSelections.includes(seg.id) ? "#111111" : "#8d867b";
  };

return (
  <div
    style={{
      width: wheelMaxWidth,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
      margin: "0 auto",
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
    transform: screenSize < 500 ? "scale(1.18)" : screenSize < 900 ? "scale(1.08)" : "scale(1)",
    transformOrigin: "center center",
  }}
>
          {isSecondaryWheel ? (
            <>
     {secondaryLeafBlockSegments.map((seg) => {
  if (
    seg.parentMid === "AROMA" ||
    seg.parentMid === "AFTERTASTE"
  ) {
    return null;
  }

  const isClickable = seg.parentInner
    ? selectedMids.includes(seg.parentInner)
    : selectedMids.includes(seg.parentMid);

  const isSelectedBlock = secondaryWheelSelections.some((id) => {
    const leaf = secondaryLeafSegments.find((item) => item.id === id);
    if (!leaf) return false;

    if (seg.parentInner) {
      return leaf.parentInner === seg.parentInner;
    }

    return leaf.parentMid === seg.parentMid;
  });

  return (
    <path
      key={`sr4-${seg.groupKey}`}
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
      strokeWidth="2.5"
      opacity={isSelectedBlock ? 1 : selectedMids.includes(seg.parentMid) ? 0.45 : 0.18}
      onClick={
        isClickable
          ? () => handleSecondaryLeafBlockClick(seg)
          : undefined
      }
      style={{ cursor: isClickable ? "pointer" : "default" }}
    />
  );
})}

              {secondaryInnerSegments.map((seg) => {
                const isClickable = selectedMids.includes(seg.parentMid);
                const isSelected =
  selectedMids.includes(seg.label) ||
  secondaryWheelSelections.some((id) => {
    const leaf = secondaryLeafSegments.find((item) => item.id === id);
    return leaf ? leaf.parentInner === seg.label : false;
  });

                return (
                  <path
                    key={`sr3-${seg.label}-${seg.parentMid}`}
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
                    strokeWidth={isSelected ? "5" : "3"}
                    opacity={isSelected ? 1 : isClickable ? 0.65 : 0.25}
                    onClick={isClickable ? () => handleInnerClick(seg) : undefined}
                    style={{ cursor: isClickable ? "pointer" : "default" }}
                  />
                );
              })}

              {secondaryMidSegments.map((seg) => {
                const isSelected = selectedMids.includes(seg.label);

                return (
                  <path
                    key={`sr2-${seg.label}`}
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
                    onClick={() => handleMidClick(seg)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}

              {secondaryTopSegments.map((seg) => (
                <path
                  key={`sr1-${seg.label}`}
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
                  strokeWidth="5"
                  opacity={getSecondaryRing1Opacity(seg.label)}
                  style={{ cursor: "default" }}
                />
              ))}
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
                const isSelected =
                  selectedMids.includes(seg.label) ||
                  (!seg.hasOuterBlock && secondarySelections.includes(seg.label));

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
              const rotation = getTextRotation(midAngle);
              const lines = seg.label.split("\n");

              return (
                <g
                  key={`t1-${index}`}
                  transform={`rotate(${rotation} ${pos.x} ${pos.y})`}
                >
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
                      fontSize="11"
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
            secondaryTopSegments.map((seg) => {
              const textArcRadius = secondaryRing1TextRadius;
              const textStart = seg.start + 10;
              const textEnd = seg.end - 10;

              const arcStart = polarToCartesian(cx, cy, textArcRadius, textStart);
              const arcEnd = polarToCartesian(cx, cy, textArcRadius, textEnd);
              const largeArcFlag = textEnd - textStart <= 180 ? 0 : 1;

              const pathId = `cup-profile-arc-${seg.label}`;

              return (
                <g key={`st1-${seg.label}`}>
                  <path
                    id={pathId}
                    d={`M ${arcStart.x} ${arcStart.y} A ${textArcRadius} ${textArcRadius} 0 ${largeArcFlag} 1 ${arcEnd.x} ${arcEnd.y}`}
                    fill="none"
                    stroke="none"
                  />
                  <text
                    fill="#ffffff"
                    fontSize="15"
                    fontWeight="700"
                    style={{
                      letterSpacing: "0.4px",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    <textPath
                      href={`#${pathId}`}
                      startOffset="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {seg.label}
                    </textPath>
                  </text>
                </g>
              );
            })}

          {isSecondaryWheel &&
            secondaryMidSegments.map((seg) => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = textPoint(cx, cy, secondaryRing2TextRadius, midAngle);
              const lines = seg.label.split("\n");
              const rotation = midAngle > 180 ? midAngle + 180 : midAngle;

              return (
                <g
                  key={`st2-${seg.label}`}
                  transform={`translate(${pos.x} ${pos.y}) rotate(${rotation})`}
                >
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={0}
                      y={i * 12 - ((lines.length - 1) * 12) / 2}
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
            secondaryInnerSegments.map((seg) => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = textPoint(cx, cy, secondaryRing3TextRadius, midAngle);
              const rotation = midAngle > 180 ? midAngle + 180 : midAngle;

              return (
                <g
                  key={`st3-${seg.label}-${seg.parentMid}`}
                  transform={`translate(${pos.x} ${pos.y}) rotate(${rotation})`}
                >
                  <text
                    x={0}
                    y={0}
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
            secondaryLeafSegments.map((seg) => {
              const midAngle = (seg.start + seg.end) / 2;
              const isEdge =
                seg.parentMid === "AROMA" || seg.parentMid === "AFTERTASTE";
              const radius = isEdge
                ? secondaryOuterLabelRadius - 57
                : secondaryOuterLabelRadius;
              const pos = textPoint(cx, cy, radius, midAngle);
              const isLeftSide = midAngle > 180 || midAngle < 0;
              const rotation = isLeftSide ? midAngle + 90 : midAngle - 90;
              const isClickable = seg.parentInner
                ? selectedMids.includes(seg.parentInner)
                : selectedMids.includes(seg.parentMid);
              const isSelected = secondaryWheelSelections.includes(seg.id);

              return (
                <g
                  key={`st4-${seg.id}`}
                  transform={`translate(${pos.x} ${pos.y}) rotate(${rotation})`}
                  style={{ cursor: isClickable ? "pointer" : "default" }}
                >
                  <rect
                    x={isLeftSide ? 4 : -19}
                    y={-13}
                    width={17}
                    height={25}
                    fill={seg.color}
                    opacity={isSelected ? 1 : 0.18}
                    stroke={isSelected ? "#111111" : "none"}
                    strokeWidth={isSelected ? 1.5 : 0}
                    onClick={isClickable ? () => handleLeafClick(seg) : undefined}
                  />

                  <text
                    x={isLeftSide ? -8 : 8}
                    y={0}
                    textAnchor={isLeftSide ? "end" : "start"}
                    dominantBaseline="middle"
                    fill={getSecondaryRing3TextColor(seg)}
                    fontSize="16"
                    fontWeight="700"
                    style={{
                      letterSpacing: "0.2px",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
    </div>
  );
}

export default FlavorWheel;