import React from "react";
import PropTypes from "prop-types";
import SpendingChart from "./SpendingChart";

const Category = ({ category, currentMonth, payees, transactions }) => (
  <div>
    <div>{category.name}</div>
    <SpendingChart
      budgeted={category.budgeted}
      currentMonth={currentMonth}
      transactions={transactions}
    />
    {transactions.map(({ id, payeeId, date, amount }) => (
      <div key={id}>
        <div>{payees[payeeId].name}</div>
        <div>{date}</div>
        <div>{amount}</div>
      </div>
    ))}
  </div>
);

Category.propTypes = {
  category: PropTypes.shape({
    budgeted: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  currentMonth: PropTypes.string.isRequired,
  payees: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      payeeId: PropTypes.string.isRequired
    })
  ).isRequired
};

export default Category;