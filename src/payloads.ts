export type PackageList = { limit?: number; offset?: number };
export type CurrentPackageListWithResources = {
  limit?: number;
  offset?: number;
};
export type MemberList = {
  id: string;
  object_type?: string;
  capacity?: string;
};
export type PackageCollaboratorList = { id: string; capacity?: string };
export type PackageCollaboratorListForUser = { id: string; capacity?: string };
export type GroupList = {
  sort?: string;
  limit?: number;
  offset?: number;
  groups?: string[];
  all_fields?: boolean;
  include_dataset_count?: boolean;
  include_extras?: boolean;
  include_tags?: boolean;
  include_groups?: boolean;
  include_users?: boolean;
};
export type OrganizationList = {
  sort?: string;
  limit?: number;
  offset?: number;
  organizations?: string[];
  all_fields?: boolean;
  include_dataset_count?: boolean;
  include_extras?: boolean;
  include_tags?: boolean;
  include_groups?: boolean;
  include_users?: boolean;
};

export type GroupListAuthz = { available_only?: boolean; am_member?: boolean };
export type OrganizationListForUser = {
  id?: string;
  permission?: string;
  include_dataset_count?: boolean;
};
export type LicenseList = {};
export type TagList = {
  query?: string;
  vocabulary_id?: string;
  all_fields?: boolean;
};

export type UserList = {
  q?: string;
  email?: string;
  order_by?: string;
  all_fields?: boolean;
};
export type PackageShow = { id: string };
export type ResourceShow = { id: string };
export type ResourceViewShow = { id: string };
export type ResourceViewList = { id: string };
export type GroupShow = {
  id: string;
  include_datasets?: boolean;
  include_extras?: boolean;
  include_users?: boolean;
};
export type OrganizationShow = GroupShow;
export type UserShow = { id: string; include_datasets?: boolean };
export type PackageSearch = {
  q?: string;
  fq?: string;
  fq_list?: string[];
  sort?: string;
  rows?: number;
  start?: number;
};

export type UserActivityList = { id: string; offset?: number; limit?: number };
export type PackageActivityList = {
  id: string;
  offset?: number;
  limit?: number;
  include_hidden_activity?: boolean;
};
export type OrganizationActivityList = PackageActivityList;
export type GroupActivityList = PackageActivityList;
export type DashboardActivityList = { offset?: number; limit?: number };

export type ActivityShow = { id: string; include_data?: boolean };

export type DatastoreCreate = {
  resource_id: string;
  force?: boolean;
  aliases?: string[];
  fields?: { [k: string]: any }[];
  records?: { [k: string]: any }[];
  primary_key?: string[];
  indexes?: string[];
};

export type DatastoreUpsert = {
  resource_id: string;
  force?: boolean;
  records?: { [k: string]: any }[];
  method?: string;
  primary_key?: string[];
  indexes?: string[];
};

export type DatastoreInfo = {
  id: string;
};

export type DatastoreDelete = {
  resource_id: string;
  force?: boolean;
  filters?: { [k: string]: any };
};

export type DatastoreSearch = {
  resource_id: string;
  filters?: { [k: string]: any };
  q?: string | { [k: string]: any };
  distinct?: boolean;
  plain?: boolean;
  language?: string;
  limit?: number;
  offset?: number;
  fields?: string[];
  sort?: string;
  include_total?: boolean;
};

export type DatastoreSearchSql = {
  sql: string;
};
