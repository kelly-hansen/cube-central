set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "users" (
	"userId" serial NOT NULL,
	"username" TEXT NOT NULL,
	"hashedPassword" TEXT NOT NULL,
	"joinDate" timestamptz NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("userId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "records" (
	"recordId" serial NOT NULL,
	"userId" int NOT NULL,
	"puzzleTypeId" int NOT NULL,
	"recordTypeId" int NOT NULL,
	"recordDate" timestamptz NOT NULL,
	CONSTRAINT "records_pk" PRIMARY KEY ("recordId"),
	UNIQUE ("userId", "puzzleTypeId", "recordTypeId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "recordTypes" (
	"recordTypeId" serial NOT NULL,
	"label" TEXT NOT NULL,
	CONSTRAINT "recordTypes_pk" PRIMARY KEY ("recordTypeId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "puzzleTypes" (
	"puzzleTypeId" serial NOT NULL,
	"label" TEXT NOT NULL,
	CONSTRAINT "puzzleTypes_pk" PRIMARY KEY ("puzzleTypeId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "solves" (
	"solveId" serial NOT NULL,
	"time" int NOT NULL,
	"recordId" int NOT NULL,
	CONSTRAINT "solves_pk" PRIMARY KEY ("solveId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "worldRecordsData" (
	"json" json NOT NULL,
	"dateUpdated" timestampz NOT NULL
) WITH (
	OIDS=FALSE
);




ALTER TABLE "records" ADD CONSTRAINT "records_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");
ALTER TABLE "records" ADD CONSTRAINT "records_fk1" FOREIGN KEY ("puzzleTypeId") REFERENCES "puzzleTypes"("puzzleTypeId");
ALTER TABLE "records" ADD CONSTRAINT "records_fk2" FOREIGN KEY ("recordTypeId") REFERENCES "recordTypes"("recordTypeId");



ALTER TABLE "solves" ADD CONSTRAINT "solves_fk0" FOREIGN KEY ("recordId") REFERENCES "records"("recordId");
