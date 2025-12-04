-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "food" INTEGER NOT NULL,
    "venue" INTEGER NOT NULL,
    "decor" INTEGER NOT NULL,
    "photobooth" INTEGER NOT NULL,
    "giveaways" INTEGER NOT NULL,
    "emcees" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "department_presentations" INTEGER NOT NULL,
    "raffle" INTEGER NOT NULL,
    "loyalty_awards" INTEGER NOT NULL,
    "comment" TEXT,
    "name" TEXT,
    "department" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_user_id_key" ON "feedback"("user_id");
