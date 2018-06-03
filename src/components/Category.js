import React from "react";
import PropTypes from "prop-types";
import keyBy from "lodash/keyBy";
import { Link } from "react-router-dom";
import { getBudgetLink, getGroupLink } from "../utils";
import GetBudget from "./GetBudget";
import Layout from "./Layout";
import { PageTitle } from "./typeComponents";
import Icon from "./Icon";
import PageActions from "./PageActions";
import TopNumbers from "./TopNumbers";
import SpendingChart from "./SpendingChart";
import Transactions from "./Transactions";

const Category = ({
  budget,
  budgetId,
  categoryId,
  currentMonth,
  onRefreshBudget,
  onRequestBudget
}) => (
  <GetBudget
    budgetId={budgetId}
    budgetLoaded={!!budget}
    onRequestBudget={onRequestBudget}
  >
    {() => {
      const category = budget.categories.find(
        category => category.id === categoryId
      );
      const categoryGroup = budget.categoryGroups.find(
        group => group.id === category.categoryGroupId
      );
      const payees = keyBy(budget.payees, "id");
      const transactions = budget.transactions
        .filter(
          transaction =>
            transaction.categoryId === categoryId &&
            transaction.date.slice(0, 7) === currentMonth
        )
        .reverse();

      return (
        <Layout>
          <Layout.Header>
            <PageTitle>
              <Link to={getBudgetLink({ budgetId })}>
                <Icon icon="arrow-left" />
              </Link>
              <Link
                to={getGroupLink({
                  budgetId,
                  categoryGroupId: categoryGroup.id
                })}
              >
                {categoryGroup.name}
              </Link>{" "}
              <Icon icon="chevron-right" /> {category.name}
            </PageTitle>
            <PageActions
              budgetId={budgetId}
              onRefreshBudget={onRefreshBudget}
            />
          </Layout.Header>
          <Layout.Content>
            <TopNumbers
              budgeted={category.budgeted}
              spent={-category.activity}
              available={category.balance}
            />
            <SpendingChart
              budgeted={category.budgeted}
              currentMonth={currentMonth}
              transactions={transactions}
            />
            <Transactions transactions={transactions} payees={payees} />
          </Layout.Content>
        </Layout>
      );
    }}
  </GetBudget>
);

Category.propTypes = {
  budgetId: PropTypes.string.isRequired,
  categoryId: PropTypes.string.isRequired,
  currentMonth: PropTypes.string.isRequired,
  onRefreshBudget: PropTypes.func.isRequired,
  onRequestBudget: PropTypes.func.isRequired,
  budget: PropTypes.shape({
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        activity: PropTypes.number.isRequired,
        balance: PropTypes.number.isRequired,
        budgeted: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired,
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
  })
};

export default Category;
