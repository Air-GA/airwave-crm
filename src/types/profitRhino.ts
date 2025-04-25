
export type LaborType = "Cost" | "Rate";
export type PartsType = "Cost" | "Rate";
export type InvoiceType = "Cost" | "Rate";

export interface BusinessInformation {
  name: string;
  baseRate: boolean;
  id: number;
  businessTypeID: number;
  breakEvenBillOutLaborCost: number;
  breakEvenBillOutAssistantLaborCost: number;
  breakEvenBillOutMiscOrTosCost: number;
  breakEvenBillOutLaborRate: number;
  breakEvenBillOutAssistantLaborRate: number;
  breakEvenBillOutMiscOrTosRate: number;
  laborType: LaborType;
  laborPercentage: number;
  partsType: PartsType;
  partsPercentage: number;
  invoiceType: InvoiceType;
  invoicePercentage: number;
  firstLabor: number;
  secondLabor: number;
  firstMaterial: number;
  secondMaterial: number;
  miscSettingRoundUpRates: string;
  miscSettingMinimumTime: number;
  miscSettingMinimumTimeForAddon: boolean;
  miscSettingHideDecimals: boolean;
  wrenchTimeTriggered: boolean;
}
