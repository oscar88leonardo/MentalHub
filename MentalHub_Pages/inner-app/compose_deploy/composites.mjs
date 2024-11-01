import ora from 'ora'
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
import { fromString } from "uint8arrays/from-string";

const ceramic = new CeramicClient("http://34.44.205.252:7007");

/**
 * @param {Ora} spinner - to provide progress status.
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
export const writeComposite = async (spinner) => {
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

  const composite = Composite.from([
    innerverseProfileComposite,
    huddleComposite,
    huddsProfileComposite,
    scheduleComposite,
    schedProfileComposite,
    schedTherapComposite,
    schedTherapProfileComposite,
  ]);

  console.log("composite:");
  console.log(composite);

  await writeEncodedComposite(composite, "../my-app/src/__generated__/definition.json");
  spinner.info("creating composite for runtime usage");
  await writeEncodedCompositeRuntime(
    ceramic,
    "../my-app/src/__generated__/definition.json",
    "../my-app/src/__generated__/definition.js"
  );
  spinner.info("deploying composite");
  const deployComposite = await readEncodedComposite(
    ceramic,
    "../my-app/src/__generated__/definition.json"
  );

  await deployComposite.startIndexingOn(ceramic);
  spinner.succeed("composite deployed & ready for use");
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

const spinner = ora();
writeComposite(spinner)
