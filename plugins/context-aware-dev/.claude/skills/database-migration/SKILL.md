---
name: database-migration
description: Implement database migrations with Prisma, TypeORM, or Knex for schema versioning, rollbacks, and data transformations. Use when the user mentions database migrations, schema changes, Prisma, TypeORM, Knex, database versioning, or schema migrations.
---

# Database Migration Implementation Pattern

## When to Use This Skill

Use this skill when implementing:
- Database schema versioning
- Migration scripts for schema changes
- Data transformations and seeding
- Rollback strategies
- Multi-environment database management

## Framework Comparison

**Prisma** (Recommended for TypeScript projects)
- Type-safe database client
- Declarative schema
- Auto-generated migrations
- Excellent DX

**TypeORM** (Full-featured ORM)
- Supports multiple databases
- Entity-based schema
- Migration CLI
- Active Record or Data Mapper patterns

**Knex** (SQL query builder)
- Lightweight, flexible
- Raw SQL support
- Manual migration control
- Works with any Node.js app

## Implementation Steps - Prisma

### 1. Install Prisma

```bash
npm install -D prisma
npm install @prisma/client
npx prisma init
```

### 2. Define Your Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### 3. Create and Apply Migrations

```bash
# Create migration from schema changes
npx prisma migrate dev --name add-user-posts

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### 4. Use Prisma Client

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 5. Seeding Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'hashed_password_here',
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started',
        content: 'Welcome to our platform!',
        published: true,
        authorId: admin.id,
      },
      {
        title: 'Draft Post',
        content: 'This is a draft',
        published: false,
        authorId: admin.id,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to package.json:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Implementation Steps - TypeORM

### 1. Install TypeORM

```bash
npm install typeorm pg
npm install reflect-metadata
```

### 2. Configure TypeORM

```typescript
// ormconfig.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false, // Never use in production
  logging: process.env.NODE_ENV === 'development',
});
```

### 3. Create Entities

```typescript
// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Post } from './Post';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['USER', 'ADMIN', 'MODERATOR'],
    default: 'USER',
  })
  role: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4. Generate and Run Migrations

```bash
# Generate migration from entity changes
npx typeorm migration:generate src/migrations/AddUserPosts -d ormconfig.ts

# Run migrations
npx typeorm migration:run -d ormconfig.ts

# Revert last migration
npx typeorm migration:revert -d ormconfig.ts

# Create empty migration
npx typeorm migration:create src/migrations/CustomMigration
```

### 5. Custom Migration Example

```typescript
// src/migrations/1234567890123-AddUserIndexes.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIndexes1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email");
      CREATE INDEX "IDX_users_role" ON "users" ("role");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_users_email";
      DROP INDEX "IDX_users_role";
    `);
  }
}
```

## Implementation Steps - Knex

### 1. Install Knex

```bash
npm install knex pg
npx knex init
```

### 2. Configure Knex

```javascript
// knexfile.js
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'myapp_dev',
      user: 'postgres',
      password: 'password',
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
    },
  },
};
```

### 3. Create Migrations

```bash
# Create migration
npx knex migrate:make create_users_table

# Run migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback

# Check status
npx knex migrate:status
```

### 4. Migration Example

```javascript
// migrations/20240101_create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('name');
    table.string('password').notNullable();
    table.enum('role', ['USER', 'ADMIN', 'MODERATOR']).defaultTo('USER');
    table.timestamps(true, true);

    table.index('email');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

## Best Practices

1. **Version Control**: Commit all migration files
2. **One-Way Migrations**: Never modify existing migrations in production
3. **Testing**: Test migrations on staging before production
4. **Rollback Strategy**: Always implement `down` migrations
5. **Data Migrations**: Separate schema and data migrations
6. **Indexes**: Add indexes in migrations for performance
7. **Timestamps**: Always track created/updated timestamps
8. **Backup**: Backup database before running migrations in production
9. **Zero Downtime**: Use techniques like blue-green deployments for large tables
10. **Naming**: Use descriptive names with timestamps

## Common Migration Patterns

### Adding Column with Default Value

```typescript
// Prisma
model User {
  isActive Boolean @default(true)
}

// TypeORM Migration
await queryRunner.query(`
  ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
`);
```

### Renaming Column

```typescript
// TypeORM
await queryRunner.renameColumn('users', 'username', 'email');

// Knex
await knex.schema.table('users', (table) => {
  table.renameColumn('username', 'email');
});
```

### Adding Foreign Key

```prisma
// Prisma
model Post {
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

## CI/CD Integration

```yaml
# .github/workflows/deploy.yml
- name: Run Migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Reference Files

- See `examples.md` for more migration patterns and edge cases
