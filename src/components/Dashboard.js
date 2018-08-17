import React, { Component } from "react";
import PropTypes from "prop-types";
import keys from "lodash/fp/keys";
import { groupByProp, sumByProp } from "../dataUtils";
import CollapsibleSection from "./CollapsibleSection";
import SunburstChart from "./SunburstChart";

class Dashboard extends Component {
  static propTypes = {
    budget: PropTypes.shape({}).isRequired,
    currentMonth: PropTypes.string.isRequired
  };

  render() {
    const { budget, currentMonth: currentMonthString } = this.props;
    const { months, categoryGroupsById } = budget;
    const currentMonth = months.find(
      month => month.month.slice(0, 7) === currentMonthString
    );
    const categoriesByGroup = groupByProp("category_group_id")(currentMonth.categories);
    const data = keys(categoriesByGroup).map(groupId => ({
      id: groupId,
      label: categoryGroupsById[groupId].name,
      value: sumByProp("balance")(categoriesByGroup[groupId])
    }));
    // const data = currentMonth.categories.map(category => ({
    //   id: category.id,
    //   label: category.name,
    //   value: category.balance
    // }));

    return (
      <CollapsibleSection title="Budget Breakdown">
        <SunburstChart data={data} />
      </CollapsibleSection>
    );
  }
}

export default Dashboard;
