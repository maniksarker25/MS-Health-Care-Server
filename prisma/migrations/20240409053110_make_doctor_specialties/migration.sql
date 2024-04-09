-- CreateTable
CREATE TABLE "spacialties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "spacialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctorSpecialties" (
    "specialtiesId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "doctorSpecialties_pkey" PRIMARY KEY ("specialtiesId","doctorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "spacialties_id_key" ON "spacialties"("id");

-- AddForeignKey
ALTER TABLE "doctorSpecialties" ADD CONSTRAINT "doctorSpecialties_specialtiesId_fkey" FOREIGN KEY ("specialtiesId") REFERENCES "spacialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorSpecialties" ADD CONSTRAINT "doctorSpecialties_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
