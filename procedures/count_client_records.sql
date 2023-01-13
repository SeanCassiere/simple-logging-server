/**
  Procedure to count the number of records in the table for a given service
 */
create or replace procedure count_client_records(serviceId text, _num_of_records inout integer DEFAULT NULL)
language plpgsql
as $$
begin
  SELECT COUNT(id)
  FROM "Log"
  WHERE "serviceId"=serviceId
  INTO _num_of_records;

  commit;
end;$$
/* Execure count_client_records procedure */
call count_client_records('serviceId', null);