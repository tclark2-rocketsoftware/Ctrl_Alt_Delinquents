# Legacy Database Migration (backup.db -> migrated.db)

This document explains how the legacy `backup.db` was migrated to the new schema defined in `quizruption/database/schema.sql`.

## Script
The migration script lives at `quizruption/database/migrate_backup.py` and:
- Loads the new schema from `schema.sql`.
- Creates a fresh `migrated.db` in the same folder.
- Copies and transforms data from `backup.db`.

## Transform Rules (Assumptions)
Because the old schema lacked some new columns, values were fabricated:
| New Column | Strategy |
|------------|----------|
| `users.username` | Derived from email prefix; ensure uniqueness by appending `_n` if needed. |
| `daily_jokes.source` | Set to `'fallback'` when missing. |
| `quizzes.created_by` | Set to `NULL` (legacy lacked author tracking). |
| `results.user_id` | Set to `NULL` if absent. |
| `results.personality` | Set to `NULL` if absent. |
| `answers.personality_tag` | Inserted as `NULL` when not present. |
| Duplicate `personality_content.personality` | Only first kept, rest skipped to satisfy UNIQUE. |

All existing timestamps were preserved when present; otherwise defaults apply.

## Running Migration
```powershell
python quizruption/database/migrate_backup.py
```
Result summary from current run:
- users: 3
- quizzes: 9
- questions: 31
- answers: 129
- results: 1
- personality_content: 5
- daily_jokes: 1
- joke_suggestions: 0

## Next Steps / Optional Enhancements
- Backfill `quizzes.created_by` by mapping quizzes to a default admin user.
- Add heuristic to infer `results.personality` from answer tags (if logic becomes available).
- Validate referential integrity with a consistency check script.

## Rollback
Remove `migrated.db` and re-run the script to regenerate.

## Safety
The migration is read-only on `backup.db` (no modifications). It recreates `migrated.db` from scratch each run.
