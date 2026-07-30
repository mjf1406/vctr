/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appConfig from "../appConfig.js";
import type * as auth from "../auth.js";
import type * as authz from "../authz.js";
import type * as authzBackfill from "../authzBackfill.js";
import type * as classes from "../classes.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as joinCodes from "../joinCodes.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_authzModel from "../lib/authzModel.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_joinCodesCleanup from "../lib/joinCodesCleanup.js";
import type * as lib_languages from "../lib/languages.js";
import type * as lib_permissionSnapshot from "../lib/permissionSnapshot.js";
import type * as lib_rateLimiter from "../lib/rateLimiter.js";
import type * as members from "../members.js";
import type * as permissions from "../permissions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appConfig: typeof appConfig;
  auth: typeof auth;
  authz: typeof authz;
  authzBackfill: typeof authzBackfill;
  classes: typeof classes;
  files: typeof files;
  http: typeof http;
  joinCodes: typeof joinCodes;
  "lib/auth": typeof lib_auth;
  "lib/authzModel": typeof lib_authzModel;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/joinCodesCleanup": typeof lib_joinCodesCleanup;
  "lib/languages": typeof lib_languages;
  "lib/permissionSnapshot": typeof lib_permissionSnapshot;
  "lib/rateLimiter": typeof lib_rateLimiter;
  members: typeof members;
  permissions: typeof permissions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  authz: import("@djpanda/convex-authz/_generated/component.js").ComponentApi<"authz">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
