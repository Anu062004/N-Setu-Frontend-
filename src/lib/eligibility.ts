import type { EligibilityDecision, EligibilityInput } from "./types";

export const SECTION12_CATEGORIES = [
  "MEMBER_OF_SCHEDULED_CASTE",
  "MEMBER_OF_SCHEDULED_TRIBE",
  "VICTIM_OF_TRAFFICKING",
  "VICTIM_OF_ABUSE_OF_POWER",
  "WOMAN_OR_CHILD",
  "DISABLED_PERSON",
  "VICTIM_OF_DISASTER",
  "INDUSTRIAL_WORKMAN",
  "CUSTODY_OR_JAIL",
  "FINANCIALLY_DISADVANTAGED",
] as const;

export const DISTRICT_FLOOR_BY_CATEGORY: Record<string, number> = {
  PROPERTY: 5000,
  FAMILY: 4000,
  EMPLOYMENT: 4000,
  CONSUMER: 3000,
  CRIMINAL: 2000,
  TENANCY: 2000,
  OTHER: 3000,
};

export function decideRoute(input: EligibilityInput): EligibilityDecision {
  if (input.selfDeclaredSection12) {
    return {
      route: "LEGAL_AID_REFERRAL",
      selfDeclared: true,
      reason:
        "You have declared a Section 12 (Legal Services Authorities Act, 1987) category. Free legal aid applies. You are referred to the District Legal Services Authority / Nyaya Bandhu and must not be charged.",
    };
  }

  if (input.feeCeiling !== null && input.feeCeiling < input.districtFloor) {
    return {
      route: "PRO_BONO_ROTATION",
      selfDeclared: false,
      reason: `Your fee ceiling (₹${input.feeCeiling.toLocaleString("en-IN")}) is below the ${input.districtFloor.toLocaleString("en-IN")} floor for this category in your district. You are routed to the pro bono duty rotation — you are assigned the next advocate on duty.`,
    };
  }

  return {
    route: "PAID",
    selfDeclared: false,
    reason:
      "You are routed to the paid directory. Results are filtered by your needs and rotated fairly — you choose the professional. A transparent quote is shown before any work begins.",
  };
}

export const CATEGORY_LABELS: Record<string, string> = {
  PROPERTY: "Property",
  FAMILY: "Family",
  EMPLOYMENT: "Employment",
  CONSUMER: "Consumer",
  CRIMINAL: "Criminal",
  TENANCY: "Tenancy / Rent deposit",
  OTHER: "Other",
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  PROPERTY: "Land, house, registry, boundary or ownership disputes.",
  FAMILY: "Marriage, divorce, maintenance, custody or inheritance.",
  EMPLOYMENT: "Salary, termination, workplace rights or contract issues.",
  CONSUMER: "Defective goods, services, refunds or unfair trade practice.",
  CRIMINAL: "FIR, police summons, bail or criminal complaint.",
  TENANCY: "Rent deposit, eviction or landlord–tenant disputes.",
  OTHER: "Anything not covered above.",
};

export const SECTION12_LABELS: Record<string, string> = {
  MEMBER_OF_SCHEDULED_CAST: "",
  MEMBER_OF_SCHEDULED_CASTE: "Member of a Scheduled Caste",
  MEMBER_OF_SCHEDULED_TRIBE: "Member of a Scheduled Tribe",
  VICTIM_OF_TRAFFICKING: "Victim of trafficking or beggar",
  VICTIM_OF_ABUSE_OF_POWER: "Victim of abuse of power",
  WOMAN_OR_CHILD: "Woman or child",
  DISABLED_PERSON: "Person with disability",
  VICTIM_OF_DISASTER: "Victim of disaster or mass violence",
  INDUSTRIAL_WORKMAN: "Industrial workman",
  CUSTODY_OR_JAIL: "In custody or jail",
  FINANCIALLY_DISADVANTAGED: "Annual income below the prescribed limit",
};