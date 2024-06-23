export const ENDPOINT_MESSAGES = {
  UnAuthorized: "Unauthorized. You must be logged in to access this endpoint.",
  ForbiddenServiceNotAvailable: "Forbidden. Service is not available.",
  ForbiddenMustBeAdmin: "Forbidden. You must be an admin to access this endpoint.",
  ServerError: "Server Error. There was an error on the server.",
  ServiceNotFound: "Service not found.",
  ServiceDisabled: "Service disabled.",
  ServiceEnabled: "Service enabled.",
  OwnServiceError: "You cannot perform this action on the service you are using.",
  ServiceIdHeaderNotProvided: "X-APP-SERVICE-ID header was not passed.",
  ServiceDoesNotExistOrDoesNotHaveNecessaryRights: "Service does not exist or does not have necessary rights.",
  DBWritesFrozen: "Database writes are currently frozen.",
  ServiceCannotDisableSelf: "You cannot disable the service you are using.",
};
