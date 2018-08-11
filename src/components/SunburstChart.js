import React, { Component } from "react";
import PropTypes from "prop-types";
import keys from "lodash/fp/keys";
import sortBy from "lodash/fp/sortBy";
import uniq from "lodash/fp/uniq";
import { keyByProp, sumByProp } from "../optimized";
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

const ANIMATION_DURATION = 300;

const normalizeData = data =>
  data.map(({ amount, name, id }) => ({ id, label: name, value: -amount }));

const addAngles = data => {
  const totalValue = sumByProp("value")(data);
  let angle = 0;

  return sortBy("value")(data)
    .reverse()
    .map(d => {
      const startAngle = angle;
      angle += d.value / totalValue * 2 * Math.PI;

      return { ...d, startAngle, endAngle: angle };
    });
};

const interpolate = (prevData, currData, progress) => {
  const prevDataById = keyByProp("id")(prevData);
  const currDataById = keyByProp("id")(currData);
  const ids = uniq(keys(prevDataById).concat(keys(currDataById)));

  return ids.map(id => {
    const previous = prevDataById[id] || {
      startAngle: 0,
      endAngle: 0,
      value: 0
    };
    const current = currDataById[id] || {
      startAngle: 0,
      endAngle: 0,
      value: 0
    };

    return {
      ...previous,
      ...current,
      startAngle:
        previous.startAngle +
        progress * (current.startAngle - previous.startAngle),
      endAngle:
        previous.endAngle + progress * (current.endAngle - previous.endAngle),
      value: previous.value + progress * (current.value - previous.value)
    };
  });
};

class SunburstChart extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired
  };

  static defaultProps = { width: 360, height: 360 };

  state = {
    previousData: null,
    currentData: null,
    animationStartTime: null
  };

  static getDerivedStateFromProps(props, state) {
    if (!state.currentData) {
      return { currentData: props.data };
    }

    if (!state.animationStartTime && props.data !== state.currentData) {
      return {
        animationStartTime: new Date().getTime(),
        previousData: state.currentData,
        currentData: props.data
      };
    }

    return null;
  }

  componentDidUpdate() {
    const { animationStartTime } = this.state;

    if (animationStartTime) {
      if (new Date().getTime() - animationStartTime >= ANIMATION_DURATION) {
        this.setState({
          previousData: null,
          animationStartTime: null
        });
      } else {
        requestAnimationFrame(() => {
          this.forceUpdate();
        });
      }
    }
  }

  render() {
    const { width, height } = this.props;
    const {
      previousData: rawPrevious,
      currentData: rawCurrent,
      animationStartTime
    } = this.state;
    const radius = Math.min(width, height) / 2;
    const currentData = normalizeData(rawCurrent);
    const previousData = rawPrevious && normalizeData(rawPrevious);

    const data = animationStartTime
      ? interpolate(
          addAngles(previousData),
          addAngles(currentData),
          (new Date().getTime() - animationStartTime) / ANIMATION_DURATION
        )
      : addAngles(currentData);

    return (
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="none" />
        <Group top={height / 2} left={width / 2}>
          <Pie
            data={[{ value: 1 }]}
            pieValue={d => d.value}
            fill="#f5f5f5"
            outerRadius={radius - 80}
            innerRadius={radius - 120}
          />
          {data.map(d => (
            <Pie
              key={d.id}
              data={[d]}
              startAngle={d.startAngle}
              endAngle={d.endAngle}
              pieValue={d => d.value}
              outerRadius={radius - 80}
              innerRadius={radius - 120}
              fill={d => colors[d.data.label.length % colors.length]}
              padAngle={0}
              onClick={data => event => {
                console.log("data:", data);
                console.log("event:", event);
              }}
            />
          ))}
        </Group>
      </svg>
    );
  }
}

export default SunburstChart;
