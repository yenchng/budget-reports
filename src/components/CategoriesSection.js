import React from "react";
import PropTypes from "prop-types";
import compose from "lodash/fp/compose";
import map from "lodash/fp/map";
import sortBy from "lodash/fp/sortBy";
import { groupByProp, sumByProp } from "../optimized";
import CollapsibleSection from "./CollapsibleSection";
import { SecondaryText } from "./typeComponents";
import { ListItemLink } from "./ListItem";
import LabelWithTransactionCount from "./LabelWithTransactionCount";
import AmountWithPercentage from "./AmountWithPercentage";

const mapWithKeys = map.convert({ cap: false });

const CategoriesSection = ({
  budget,
  categoryGroupId,
  linkFunction,
  transactions
}) => {
  const { categoriesById } = budget;
  let total = 0;
  const categories = compose([
    sortBy("amount"),
    mapWithKeys((transactions, categoryId) => {
      const amount = sumByProp("amount")(transactions);
      total += amount;

      return {
        category: categoriesById[categoryId],
        transactions: transactions.length,
        amount
      };
    }),
    groupByProp("categoryId")
  ])(transactions);

  return (
    <CollapsibleSection title="Categories">
      {categories.map(({ category, transactions, amount }) => (
        <ListItemLink key={category.id} to={linkFunction(category.id)}>
          <SecondaryText style={{ whiteSpace: "pre" }}>
            <LabelWithTransactionCount
              count={transactions}
              label={category.name}
            />
          </SecondaryText>
          <AmountWithPercentage amount={amount} total={total} />
        </ListItemLink>
      ))}
    </CollapsibleSection>
  );
};

CategoriesSection.propTypes = {
  budget: PropTypes.shape({
    categoriesById: PropTypes.object.isRequired
  }).isRequired,
  categoryGroupId: PropTypes.string.isRequired,
  linkFunction: PropTypes.func.isRequired,
  transactions: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

export default CategoriesSection;