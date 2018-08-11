import React from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/fp/sortBy";
import { Pie } from "@vx/shape";
import { Group } from "@vx/group";

const colors = [
  "#8dd3c7",
  "#ffffb3",
  "#bebada",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#b3de69",
  "#fccde5",
  "#d9d9d9",
  "#bc80bd",
  "#ccebc5",
  "#ffed6f"
];

const Label = ({ x, y, children }) => (
  <text fill="black" textAnchor="middle" x={x} y={y} dy=".33em" fontSize={9}>
    {children}
  </text>
);

const ExpenseBreakdownChart = ({ data, width = 800, height = 500 }) => {
  const radius = Math.min(width, height) / 2;
  return (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} fill="none" />
      <Group top={height / 2} left={width / 2}>
        <Pie
          data={sortBy("amount")(data).map(d => ({
            ...d,
            label: d.name
          }))}
          pieValue={d => -d.amount}
          outerRadius={radius - 80}
          innerRadius={radius - 120}
          fill={d => colors[d.index % colors.length]}
          padAngle={0}
          onClick={data => event => {
            console.log("data:", data);
            console.log("event:", event);
          }}
          centroid={(centroid, arc) => {
            const [x, y] = centroid;
            const { startAngle, endAngle } = arc;
            if (endAngle - startAngle < 0.1) return null;
            return (
              <Label x={x} y={y}>
                {arc.data.label}
              </Label>
            );
          }}
        />
      </Group>
    </svg>
  );
};

ExpenseBreakdownChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired
};

export default ExpenseBreakdownChart;
