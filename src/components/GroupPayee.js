import React, { PureComponent, Fragment } from "react";
import PropTypes from "prop-types";
import { getFirstMonth } from "../utils";
import MonthByMonthSection from "./MonthByMonthSection";
import TransactionsForPayeeSection from "./TransactionsForPayeeSection";

class GroupPayee extends PureComponent {
  static propTypes = {
    budget: PropTypes.shape({
      transactions: PropTypes.arrayOf(
        PropTypes.shape({
          categoryId: PropTypes.string
        })
      ).isRequired,
      payeesById: PropTypes.object.isRequired
    }).isRequired,
    categoryGroup: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired,
    payee: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired,
    onSelectMonth: PropTypes.func.isRequired,
    selectedMonth: PropTypes.string
  };

  render() {
    const {
      budget,
      categoryGroup,
      payee,
      selectedMonth,
      onSelectMonth
    } = this.props;
    const { transactions, categories } = budget;
    const firstMonth = getFirstMonth(budget);

    const categoriesInGroup = categories.filter(
      category => category.categoryGroupId === categoryGroup.id
    );
    const categoryIds = categoriesInGroup.map(category => category.id);
    const transactionsForGroupAndPayee = transactions.filter(
      transaction =>
        categoryIds.includes(transaction.categoryId) &&
        transaction.payeeId === payee.id
    );

    return (
      <Fragment>
        <MonthByMonthSection
          firstMonth={firstMonth}
          selectedMonth={selectedMonth}
          transactions={transactionsForGroupAndPayee}
          onSelectMonth={onSelectMonth}
        />
        <TransactionsForPayeeSection
          payeeName={payee.name}
          selectedMonth={selectedMonth}
          transactions={transactionsForGroupAndPayee}
        />
      </Fragment>
    );
  }
}

export default GroupPayee;