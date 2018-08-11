import React, { PureComponent, Fragment } from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/fp/sortBy";
import {
  simpleMemoize,
  groupByProp,
  sumByProp,
  sumBy,
  notAny
} from "../optimized";
import {
  getFirstMonth,
  getTransactionMonth,
  isIncome,
  isStartingBalanceOrReconciliation,
  isTransfer
} from "../budgetUtils";
import pages, { makeLink } from "../pages";
import { LargeListItemLink } from "./ListItem";
import { SecondaryText } from "./typeComponents";
import SunburstChart from "./SunburstChart";
import MonthByMonthSection from "./MonthByMonthSection";
import CollapsibleSection from "./CollapsibleSection";
import Section from "./Section";
import Amount from "./Amount";

const getGroupsWithMeta = simpleMemoize((budget, transactions) => {
  const { categoryGroups, categories } = budget;

  const transactionsByCategory = groupByProp("category_id")(transactions);
  const categoriesByGroup = groupByProp("category_group_id")(categories);

  return categoryGroups.map(group => {
    const amount = sumBy(category =>
      sumByProp("amount")(transactionsByCategory[category.id] || [])
    )(categoriesByGroup[group.id]);
    const transactions = sumBy(
      category => (transactionsByCategory[category.id] || []).length
    )(categoriesByGroup[group.id]);

    return { ...group, amount, transactions };
  });
});

class Groups extends PureComponent {
  static propTypes = {
    budget: PropTypes.object.isRequired,
    investmentAccounts: PropTypes.object.isRequired,
    sort: PropTypes.oneOf(["amount", "name", "transactions"]).isRequired
  };

  state = { selectedMonth: null };

  handleSelectMonth = month => {
    this.setState(state => ({
      selectedMonth: state.selectedMonth === month ? null : month
    }));
  };

  render() {
    const { budget, sort, investmentAccounts } = this.props;
    const { selectedMonth } = this.state;

    const firstMonth = getFirstMonth(budget);

    const transactions = budget.transactions.filter(
      notAny([
        isStartingBalanceOrReconciliation(budget),
        isIncome(budget),
        isTransfer(investmentAccounts)
      ])
    );

    const transactionsInMonth = transactions.filter(
      transaction =>
        !selectedMonth || getTransactionMonth(transaction) === selectedMonth
    );

    const groupsWithMeta = getGroupsWithMeta(budget, transactionsInMonth);
    const sortedGroups = sortBy(
      sort === "name" ? group => group.name.replace(/[^a-zA-Z0-9]/g, "") : sort
    )(groupsWithMeta);

    return (
      <Fragment>
        <MonthByMonthSection
          firstMonth={firstMonth}
          selectedMonth={selectedMonth}
          transactions={transactions}
          onSelectMonth={this.handleSelectMonth}
        />
        <CollapsibleSection title="Breakdown Chart">
          <SunburstChart data={groupsWithMeta} />
        </CollapsibleSection>
        <Section noPadding>
          {sortedGroups.map(group => (
            <LargeListItemLink
              key={group.id}
              to={makeLink(pages.group.path, {
                budgetId: budget.id,
                categoryGroupId: group.id
              })}
            >
              <div style={{ whiteSpace: "pre" }}>{group.name}</div>
              <SecondaryText style={{ textAlign: "right" }}>
                <Amount amount={group.amount} />
              </SecondaryText>
            </LargeListItemLink>
          ))}
        </Section>
      </Fragment>
    );
  }
}

export default Groups;
