
// Content Management related types for Profit Rhino API

// Content Update Types
export interface ContentUpdateResponse {
  id: number;
  imageUrl: string;
  productName: string;
  lastPublishedDate: string;
  lastUpdatedDate: string;
  updateBody: string;
  productStatus: "UpdatesPending" | "NoUpdates" | "Complete";
  page: number;
  pageSize: number;
  totalCount: number;
  totalNumberOfPages: number;
  hasMore: boolean;
}

export interface ContentUpdateTasksResponse {
  tasks: Array<{
    isOem: boolean;
    revisionRecordID: number;
    brandId: string;
    brand: string;
    businessType: string;
    id: number;
    taskNumber: string;
    name: string;
    crNumber: string;
    description: string;
    businessTypeId: number;
    time: number;
    valueRate: number;
    standardRate: number;
    premiumRate: number;
  }>;
  page: number;
  pageSize: number;
  totalCount: number;
  totalNumberOfPages: number;
  hasMore: boolean;
}

export interface ContentUpdatePartsResponse {
  parts: Array<{
    mfgName: string;
    revisionRecordID: number;
    id: number;
    mfgPart: string;
    partNumber: string;
    description: string;
    prodLineName: string;
    categoryName: string;
  }>;
  page: number;
  pageSize: number;
  totalCount: number;
  totalNumberOfPages: number;
  hasMore: boolean;
}

// Tasks Related Types
export interface TaskImage {
  id: number;
  order: number;
  url: string;
}

export interface TaskAssignment {
  id: number;
  name: string;
  businessType: string;
  sortOrder: number;
}

export interface TaskRelatedItem {
  assignmentId: number;
  taskId: number;
  taskNumber: string;
  name: string;
  valueRate: string;
  standardRate: string;
  premiumRate: string;
  addonValueRate: string;
  addonStandardRate: string;
  addonPremiumRate: string;
  addonEnabled: boolean;
  position: number;
  isManaged: string;
  id: number;
  refUrl: string;
}

export interface TaskPrice {
  valueRate: string;
  standardRate: string;
  premiumRate: string;
  addonValueRate: string;
  addonStandardRate: string;
  addonPremiumRate: string;
  stdRateLabourPer: number;
  prmRateLabourPer: number;
  id: number;
  refUrl: string;
}

export interface TaskPart {
  qty: number;
  order: number;
  status: string;
  cost: string;
  price: string;
  number: string;
  mfgName: string;
  mfgPart: string;
  description: string;
  assignmentId: number;
  isManaged: string;
  id: number;
  refUrl: string;
}

export interface TaskDocument {
  id: number;
  refUrl: string;
}

export interface TaskDetail {
  id: number;
  taskNumber: string;
  createdDate: string;
  modifiedDate: string;
  name: string;
  description: string;
  marketingDescription: string;
  quickAddType: number;
  isHidden: boolean;
  isRefrigerant: boolean;
  brandId: number;
  brandName: string;
  businessTypeId: number;
  businessType: string;
  taskDuration: number;
  taskAsstTime: number;
  addonEnabled: boolean;
  addonNumber: string;
  addonDuration: number;
  addonAsstTime: number;
  isActive: boolean;
  valueRateOnly: boolean;
  isDiscountService: boolean;
  paysCommission: boolean;
  taxable: boolean;
  taskPriceType: number;
  addonPriceType: number;
  valueRate: number;
  standardRate: number;
  premiumRate: number;
  addonValueRate: number;
  addonStandardRate: number;
  addonPremiumRate: number;
  commissionAmount: number;
  isOem: boolean;
  crNumber: string;
  requiresRefrigerant: boolean;
  account: string;
  defaultAccount: string;
  position: number;
  images: TaskImage[];
  crossSellTasks: TaskRelatedItem[];
  upSellTasks: TaskRelatedItem[];
  taskPrices: TaskPrice[];
  parts: TaskPart[];
  documents: TaskDocument[];
  taskAssignmentId: number;
  externalId: string;
  taskCategories: Array<{
    assignments: TaskAssignment[];
  }>;
  isManaged: string;
  bookShow: boolean;
}

export interface TaskCompareResponse {
  licensedTask: TaskDetail;
  customerTask: TaskDetail;
  page: number;
  pageSize: number;
  totalCount: number;
  totalNumberOfPages: number;
  hasMore: boolean;
}

// Parts Related Types
export interface ProductLine {
  id: number;
  name: string;
  refUrl: string;
  partCategory: {
    id: number;
    name: string;
    refUrl: string;
  };
}

export interface PartDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  cost: number;
  isActive: boolean;
  isSensitive: boolean;
  markUpExempt: boolean;
  retailPrice: number;
  mfgName: string;
  mfgId: number;
  mfgPart: string;
  upc: string;
  tradeServicePart: string;
  paysCommission: boolean;
  externalId: string;
  account: string;
  createdDate: string;
  lastUpdatedDate: string;
  productLine: ProductLine;
  isManaged: string;
}

export interface PartCompareResponse {
  licensedPart: PartDetail;
  customerPart: PartDetail;
  page: number;
  pageSize: number;
  totalCount: number;
  totalNumberOfPages: number;
  hasMore: boolean;
}

// Category Tree Types
export interface CategoryTree {
  content: any;
  hasTreeChildren: boolean;
  children: any[];
}
