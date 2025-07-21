import { type CheckProductPreview } from "autumn-js";
import { useTranslations } from "next-intl";

export const getPricingTableContent = (product: any, t?: ReturnType<typeof useTranslations>) => {
  const { scenario, free_trial } = product;

  // Fallback if no translation function is provided
  const _t = t || ((key: string) => key);

  if (free_trial && free_trial.trial_available) {
    return {
      buttonText: <p>{_t("actions.startTrial")}</p>,
    };
  }

  switch (scenario) {
    case "scheduled":
      return {
        buttonText: <p>{_t("actions.planScheduled")}</p>,
      };

    case "active":
      return {
        buttonText: <p>{_t("actions.currentPlan")}</p>,
      };

    case "new":
      if (product.properties?.is_one_off) {
        return {
          buttonText: <p>{_t("actions.purchase")}</p>,
        };
      } else {
        return {
          buttonText: <p>{_t("actions.getStarted")}</p>,
        };
      }

    case "renew":
      return {
        buttonText: <p>{_t("actions.renew")}</p>,
      };

    case "upgrade":
      return {
        buttonText: <p>{_t("actions.upgrade")}</p>,
      };

    case "downgrade":
      return {
        buttonText: <p>{_t("actions.downgrade")}</p>,
      };

    case "cancel":
      return {
        buttonText: <p>{_t("actions.cancelPlan")}</p>,
      };

    default:
      return {
        buttonText: <p>{_t("actions.getStarted")}</p>,
      };
  }
};
