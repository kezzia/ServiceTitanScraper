A chrome extension that scrapes ServiceTitan invoice pages for for customer info
and returns them as a copiable spreadsheet row.


OVERVIEW
The spreadsheet has the following columns:
DATE - DateTime
JOB NUMBER - String
TECHNICIAN(S) - Arrayof String
CUSTOMER - String
JOB PICTURES - Boolean
INVOICE DESCRIPTION - Boolean
PRICE ON JOB - Boolean
NO CHARGE - Boolean
JOB COMPLETE - Boolean 
INVOICE SENT TO CUSTOMER - Boolean
CASH/CHECK PAYMENT - Boolean
PAYMENT DELIVERED - Boolean 

TODOS:
1. Add name of assigned tech(s) to copy row.
2. Date on job should be actual date job was performed not today's date.
3. Extension icon should not appear on pages where it can't be used.
4. If SERVICE LOCATION is different from BILL TO combine the two
For example....
+------------------+----------------+----------------------------+
| SERVICE LOCATION | BILL TO        | RESULT                     |
+------------------+----------------+----------------------------+
| Sherlock Holmes  | P. Sherman     | P. Sherman (221B Baker St) |
| 221B Baker St    | 42 Wallaby Way | 42 Wallaby Way             |
| London           | Syndey         | Sydney                     |
+------------------+----------------+----------------------------+

STRETCH GOALS:
1. Auto-populate Photos/Invoice Description fields.
