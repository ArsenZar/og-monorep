-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "templateId" TEXT;

-- CreateIndex
CREATE INDEX "Task_templateId_idx" ON "Task"("templateId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
