import React from "react";
import PropTypes from "prop-types";
import { simpleMemoize } from "../optimized";
import SunburstChart from "./SunburstChart";

const normalizeData = simpleMemoize(data =>
  data.map(({ amount, name, id }) => ({
    id,
    label: name,
    value: Math.max(-amount, 0)
  }))
);

const GroupsBreakdownChart = ({ groups }) => (
  <SunburstChart data={normalizeData(groups)} />
);

GroupsBreakdownChart.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired
};

export default GroupsBreakdownChart;
