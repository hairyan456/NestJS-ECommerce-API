/*
  Warnings:

  - Changed the type of `variants` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "variants",
ADD COLUMN     "variants" JSONB NOT NULL;
