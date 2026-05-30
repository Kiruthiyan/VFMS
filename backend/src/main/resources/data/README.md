# Employee Registry Import Template

Use this file to load verified company staff records for self-service signup validation.

## Columns

- `employeeId` — unique company employee ID (required)
- `email` — official company email (required)
- `nic` — national identity card number (required)
- `phone` — contact number (required)
- `fullName` — staff member full name (required)
- `department` — department name (required)
- `designation` — job title (required)
- `officeLocation` — office or branch (required)
- `active` — `true` or `false`

## Notes

- Mock/demo employee rows were removed from startup seeding.
- Add your real company staff rows to `employee-registry.csv` or insert them directly into the `employee_registry` table.
- Staff signup validates email, employee ID, NIC, phone, and full name against these records.
