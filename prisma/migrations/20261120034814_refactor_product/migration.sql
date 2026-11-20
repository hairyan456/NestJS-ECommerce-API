/*
  Warnings:

  - You are about to drop the column `images` on the `SKU` table. All the data in the column will be lost.
  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SKUToVariantOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `SKU` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_variantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_B_fkey";

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "name" VARCHAR(500) NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "variants" JSONB[] NOT NULL;

-- AlterTable
ALTER TABLE "public"."SKU" DROP COLUMN "images",
ADD COLUMN     "image" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Variant";

-- DropTable
DROP TABLE "public"."VariantOption";

-- DropTable
DROP TABLE "public"."_SKUToVariantOption";

CREATE UNIQUE INDEX "ProductTranslation_productId_languageId_unique"
ON "ProductTranslation" ("productId", "languageId")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "SKU_productId_value_unique"
ON "SKU" ("productId", "value")
WHERE "deletedAt" IS NULL;
