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

const ceramic = new CeramicClient("http://192.168.1.105:7007");

/**
 * @param {Ora} spinner - to provide progress status.
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
export const writeComposite = async (spinner) => {
  await authenticate();
  console.log(ceramic);
  const innerverseProfileComposite = await createComposite(
    ceramic,
    "../composites/innerverseProfile.graphql"
  );
  console.log(innerverseProfileComposite);

  /*const innerverseProfile = readFileSync("./composites/innerverProfile.json", {
    encoding: "utf-8",
  })
  console.log("innerverseProfile:");
  console.log(innerverseProfile);
  const innerverseProfileComposite = await Composite.fromJSON({
    ceramic,
    definition: innerverseProfile,
  });

  const composite = Composite.from([
    profileComposite,
    postsComposite,
    followingComposite,
    postsProfileComposite,
    commentsComposite,
    commentsPostsComposite,
  ]);*/

  await writeEncodedComposite(innerverseProfileComposite, "../my-app/src/__generated__/definition.json");
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
  console.log(seed)
  const key = fromString(seed, "base16");
  console.log(key)
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key),
  });
  console.log(did)
  await did.authenticate();
  console.log(did.authenticated)
  ceramic.did = did;
};

const spinner = ora();
writeComposite(spinner)
