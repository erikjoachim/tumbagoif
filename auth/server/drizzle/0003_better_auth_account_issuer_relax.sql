ALTER TABLE "account" ALTER COLUMN "issuer" DROP NOT NULL;

DROP INDEX IF EXISTS "account_issuer_accountid_key";
DROP INDEX IF EXISTS "account_issuer_accountId_uidx";
