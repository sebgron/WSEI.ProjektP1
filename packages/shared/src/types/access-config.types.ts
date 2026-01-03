export interface IEntranceCode {
  label: string;
  code: string;
}

export interface IAccessConfigResponse {
  id: number;
  name: string;
  entranceCodes?: IEntranceCode[];
  generalInstructions?: string;
}
