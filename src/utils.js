import {utils} from "ynab";
import moment from "moment";
import {groupBy, notAny, sumBy} from "./optimized";
import {isIncome, isStartingBalanceOrReconciliation, isTransfer} from "./budgetUtils";
import filter from "lodash/fp/filter";
import mapRaw from "lodash/fp/map";
import mean from "lodash/fp/mean";

const map = mapRaw.convert({ cap: false });

export const formatCurrency = utils.convertMilliUnitsToCurrencyAmount;

export const getStorage = key => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
};

export const setStorage = (key, obj) => {
  localStorage.setItem(key, JSON.stringify(obj));
};

export const upsertBy = (arr, key, obj, updater = (prev, curr) => curr) => {
  let exists = false;
  const newArr = arr.map(item => {
    if (item[key] === obj[key]) {
      exists = true;
      return updater(item, obj);
    }
    return item;
  });
  return exists ? newArr : newArr.concat(obj);
};

export const filterTransactions = ({
  budget,
  investmentAccounts = {}
}) => transactions =>
  transactions.filter(
    notAny([
      isStartingBalanceOrReconciliation(budget),
      isTransfer(investmentAccounts)
    ])
  );

export const splitTransactions = ({ budget, transactions }) => {
  const grouped = groupBy(isIncome(budget))(transactions);

  return {
    incomeTransactions: grouped.true || [],
    expenseTransactions: grouped.false || []
  };
};

export const getMonthsToNow = firstMonth => {
  const currentMonth = moment().format("YYYY-MM");
  const months = [firstMonth];
  let m = firstMonth;

  while (m !== currentMonth) {
    m = moment(m)
      .add(1, "months")
      .format("YYYY-MM");
    months.push(m);
  }

  return months;
};

const standardDeviation = arr => {
  const avg = mean(arr);
  return Math.sqrt(sumBy(num => Math.pow(num - avg, 2))(arr) / arr.length);
};

export const getOutliersBy = f => arr => {
  const values = map(f)(arr);
  const stdDev = standardDeviation(values);
  const avg = mean(values);

  return filter(item => Math.abs(f(item) - avg) > stdDev)(arr);
};
