              altrix migrate create
                       │
                       ▼
                  loadModels()
                       │
                       ▼
                 Decorators run
                       │
                       ▼
                    Registry
                       │
                       ▼
                  buildSchema()
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       old snapshot          current schema
             │                   │
             └─────────┬─────────┘
                       ▼
                  diffSchemas()
                       ▼
              MigrationOperation[]
                       ▼
                  MySQL SQL
                       ▼
                migration.ts