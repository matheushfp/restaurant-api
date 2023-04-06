// interface to show relevant error messages in errors captured by zod
export default interface ICustomError {
  field: (string | number)[];
  message: string;
}
