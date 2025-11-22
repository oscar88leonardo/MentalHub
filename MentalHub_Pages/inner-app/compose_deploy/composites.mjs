import { readFileSync } from "fs";
import { CeramicClient } from "@ceramicnetwork/http-client";
import {
  createComposite,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime
} from "@composedb/devtools-node";
import { Composite } from "@composedb/devtools";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays";

const ceramic = new CeramicClient("https://ceramicnode.innerverse.care");

/**
 * @return {Promise<void>} - return void cuando la composite termina de desplegarse.
 */
export const writeComposite = async () => {
  await authenticate();
  const innerverseProfileComposite = await createComposite(
    ceramic,
    "../composites/innerverseProfile.graphql"
  );
  //console.log(innerverseProfileComposite.modelIDs);

  const scheduleSchema = readFileSync("../composites/innerverseSchedule.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);
  
  const scheduleComposite = await Composite.create({
    ceramic,
    schema: scheduleSchema,
  });
  /*console.log('scheduleComposite:')
  console.log(scheduleComposite.modelIDs);*/
  // Schedules relationFrom is now defined directly in innerverseSchedule.graphql via `extend type`,
  // por lo tanto no necesitamos innerverseScheduleProfile.graphql aquí.

  const schedTherapSchema = readFileSync("../composites/innerverseSchedTherapist.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);
  
  const schedTherapComposite = await Composite.create({
    ceramic,
    schema: schedTherapSchema,
  });
  
  const schedTherapProfileSchema = readFileSync(
    "../composites/innerverseSchedTherapProfile.graphql",
    {
      encoding: "utf-8",
    }
  )
    .replace("$SCHE_ID", schedTherapComposite.modelIDs[1])
    .replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);
    //console.log('schedTherapComposite:');
    //console.log(schedTherapComposite.modelIDs);
  //console.log(schedTherapProfileSchema);
  const schedTherapProfileComposite = await Composite.create({
    ceramic,
    schema: schedTherapProfileSchema,
  });

  // therapist_sched relationFrom también vive ahora en innerverseSchedule.graphql; se omite el link auxiliar.

  const workshopSchema = readFileSync(
    "../composites/innerverseWorkshop.graphql",
    {
      encoding: "utf-8",
    }
  ).replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);

  const workshopComposite = await Composite.create({
    ceramic,
    schema: workshopSchema,
  });

  // Perfiles extendidos sin versionado (Terapeuta y Consultante)
  const therapistSchema = readFileSync(
    "../composites/therapistProfile.graphql",
    { encoding: "utf-8" }
  ).replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);

  const therapistComposite = await Composite.create({
    ceramic,
    schema: therapistSchema,
  });

  const consultantSchema = readFileSync(
    "../composites/consultantProfile.graphql",
    { encoding: "utf-8" }
  ).replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);

  const consultantComposite = await Composite.create({
    ceramic,
    schema: consultantSchema,
  });

  // Relaciones inversas sin versionado
  const therapistProfileSchema = readFileSync(
    "../composites/innerverseTherapistProfile.graphql",
    { encoding: "utf-8" }
  )
    .replace("$THERAPIST_ID", therapistComposite.modelIDs[1])
    .replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);

  const therapistProfileComposite = await Composite.create({
    ceramic,
    schema: therapistProfileSchema,
  });

  const consultantProfileSchema = readFileSync(
    "../composites/innerverseConsultantProfile.graphql",
    { encoding: "utf-8" }
  )
    .replace("$CONSULTANT_ID", consultantComposite.modelIDs[1])
    .replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);

  const consultantProfileComposite = await Composite.create({
    ceramic,
    schema: consultantProfileSchema,
  });

  const composite = Composite.from([
    innerverseProfileComposite,
    scheduleComposite,
    // schedProfileComposite (omitido)
    schedTherapComposite,
    schedTherapProfileComposite,
    // schedTherapistLinkComposite (omitido)
    workshopComposite,
    therapistComposite,
    therapistProfileComposite,
    consultantComposite,
    consultantProfileComposite,
  ]);

  console.log("composite:");
  console.log(composite);

  await writeEncodedComposite(composite, "../my-dapp/src/__generated__/definition.json");
  console.log("creating composite for runtime usage");
  await writeEncodedCompositeRuntime(
    ceramic,
    "../my-dapp/src/__generated__/definition.json",
    "../my-dapp/src/__generated__/definition.js"
  );
  console.log("deploying composite");
  const deployComposite = await readEncodedComposite(
    ceramic,
    "../my-dapp/src/__generated__/definition.json"
  );

  await deployComposite.startIndexingOn(ceramic);
  console.log("composite deployed & ready for use");
};

/**
 * Authenticating DID for publishing composite
 * @return {Promise<void>} - return void when DID is authenticated.
 */
const authenticate = async () => {
  const seed = readFileSync("./admin_seed.txt");
  const key = fromString(seed, "base16");
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key),
  });
  await did.authenticate();
  ceramic.did = did;
};

writeComposite()
