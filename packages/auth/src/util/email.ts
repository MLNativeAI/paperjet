import { logger } from "@paperjet/shared";
import { COMMON_EMAIL_PROVIDERS } from "./const";

export const detectOrgNameFromEmail = async (email: string): Promise<string> => {
  let orgName = email.split("@")[0];

  try {
    const domainCandidate = email.split("@")[1]; // xyz.com
    const domainWithoutSuffix = domainCandidate?.split(".")[0]; // @xyz.com -> xyz
    if (domainWithoutSuffix && domainCandidate) {
      if (COMMON_EMAIL_PROVIDERS.includes(domainCandidate)) {
        return orgName || "Default";
      }
      orgName = domainWithoutSuffix.charAt(0).toUpperCase() + domainWithoutSuffix.slice(1); // xyz -> Xyz
    }
  } catch (e) {
    logger.error(e, `Could not establish user domain: ${email}`);
  }
  return orgName || "Default";
};
