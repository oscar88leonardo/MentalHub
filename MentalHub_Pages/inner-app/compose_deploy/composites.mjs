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
  const huddleSchema = readFileSync("../composites/innerverseHuddle01.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);
  
  const huddleComposite = await Composite.create({
    ceramic,
    schema: huddleSchema,
  });
  //console.log(huddleComposite.modelIDs)
  const huddsProfileSchema = readFileSync(
    "../composites/innerverseHuddProfile.graphql",
    {
      encoding: "utf-8",
    }
  )
    .replace("$HUDD_ID", huddleComposite.modelIDs[1])
    .replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);
  //console.log(huddsProfileSchema);
  const huddsProfileComposite = await Composite.create({
    ceramic,
    schema: huddsProfileSchema,
  });

  const scheduleSchema = readFileSync("../composites/innerverseSchedule.graphql", {
    encoding: "utf-8",
  }).replace("$HUDD_ID", huddleComposite.modelIDs[1])
    .replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);
  
  const scheduleComposite = await Composite.create({
    ceramic,
    schema: scheduleSchema,
  });
  /*console.log('scheduleComposite:')
  console.log(scheduleComposite.modelIDs);*/
  const schedProfileSchema = readFileSync(
    "../composites/innerverseScheduleProfile.graphql",
    {
      encoding: "utf-8",
    }
  )
    .replace("$SCHE_ID", scheduleComposite.modelIDs[2])
    .replace("$PROFILE_ID", innerverseProfileComposite.modelIDs[0]);
  
  const schedProfileComposite = await Composite.create({
    ceramic,
    schema: schedProfileSchema,
  });

  const SchedHuddle01Schema = readFileSync(
    "../composites/innerverseSchedHuddle01.graphql",
    {
      encoding: "utf-8",
    }
  )
    .replace("$HUDD_ID", huddleComposite.modelIDs[1])
    .replace("$SCHE_ID", scheduleComposite.modelIDs[2])
  //console.log(huddsProfileSchema);
  const SchedHuddle01Composite = await Composite.create({
    ceramic,
    schema: SchedHuddle01Schema,
  });

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

  const composite = Composite.from([
    innerverseProfileComposite,
    huddleComposite,
    huddsProfileComposite,
    scheduleComposite,
    schedProfileComposite,
    SchedHuddle01Composite,
    schedTherapComposite,
    schedTherapProfileComposite,
    workshopComposite,
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
