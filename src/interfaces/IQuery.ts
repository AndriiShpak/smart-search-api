export interface IQueryIdentifyResponse {
  queryText: string;
  parameters: {
    [parameter: string]: string[];
  };
  allRequiredParamsPresent: boolean;
  intentDialogflowId: string;
}
