import { api as YnabApi } from "ynab";
import { getStorage } from "./utils";
import { makeCachedCall, sanitizeBudget } from "./repoUtils";
import { clientId, redirectUri } from "./ynabConfig";

export const AUTHORIZE_URL =
  "https://app.youneedabudget.com/oauth/authorize?client_id=" +
  clientId +
  "&redirect_uri=" +
  redirectUri +
  "&response_type=token";

let api = null;
const TOKEN_STORAGE_KEY = "ynab_access_token";

export let getBudgets = null;
export let getBudget = null;
export let getUpdatedBudget = null;

export const getAuthorizeToken = () => {
  if (window.location.hash[1] === "/") {
    // It's probably a route
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  const search = window.location.hash
    .substring(1)
    .replace(/&/g, '","')
    .replace(/=/g, '":"');

  if (!search) {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  const params = JSON.parse(
    '{"' + search + '"}',
    (key, value) => (key === "" ? value : decodeURIComponent(value))
  );
  const token = params["access_token"];

  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.location.hash = "";

  return token;
};

const handleFailure = () => {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.location.reload();
};

export const initializeYnabApi = token => {
  api = new YnabApi(token);

  getBudgets = makeCachedCall({
    apiCall: api.budgets.getBudgets.bind(api.budgets),
    storageKey: "ynab_budgets",
    onFailure: handleFailure
  });

  getBudget = makeCachedCall({
    apiCall: api.budgets.getBudgetById.bind(api.budgets),
    formatter: ({ budget }) => ({ budget: sanitizeBudget(budget) }),
    storageKey: "ynab_budget_details",
    onFailure: handleFailure
  });

  getUpdatedBudget = id => {
    const details = getStorage("ynab_budget_details");
    const budgetDetails = details[id];
    const serverKnowledge = budgetDetails.server_knowledge;
    console.log("details:", details);

    return api.budgets
      .getBudgetById(id, serverKnowledge)
      .then(({ data }) => {
        console.log(data);
        return data;
      })
      .catch(handleFailure);
  };
};
