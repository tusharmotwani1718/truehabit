import arcjet, { tokenBucket, validateEmail, detectBot, protectSignup, slidingWindow, shield } from "@arcjet/node";
import dotenv from 'dotenv';
import { ApiError } from "./ApiError.js";
import envconf from "../conf/envconfig.js";
dotenv.config();

class Arcjet {
    // required attributes for arcjet:
    aj;
    key;

    constructor() {
        if (!envconf.arcjetKey) {
            throw new Error("ARCJET_KEY environment variable is not set.");
        }
        this.key = envconf.arcjetKey;
        this.defaultConfig = {
            key: this.key,
            rules: [
                shield({ mode: "LIVE" })
            ],
        };
        this.aj = arcjet(this.defaultConfig); // Initialize arcjet with default config
    }

    // METHOD 1: rate limiting:
    rateLimit({ mode = "LIVE", refillRate = 5, interval = 10, capacity = 15 } = {}) {
        try {
            return arcjet({
                ...this.defaultConfig,
                characteristics: ["userId"], // track requests by a custom user ID
                rules: [
                    ...this.defaultConfig.rules,
                    tokenBucket({
                        mode, // "LIVE" will block requests. Use "DRY_RUN" to log only
                        refillRate, // refill 'number' tokens per interval
                        interval, // refill every 'number' seconds
                        capacity, // bucket maximum capacity of 'number' tokens
                    }),
                ],
            });
            
        } catch (error) {
            console.log("Arcjet Service Error :: " + error);
            throw new ApiError(500, "Internal Server Error");
        }
    }

    // METHOD 2: bot protection:
    botProtection({ mode = "LIVE" } = {}) {
        try {
            return (arcjet({
                ...this.defaultConfig,
                rules: [
                    ...this.defaultConfig.rules,
                    detectBot({
                        mode,
                        allow: [
                            "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                            //"CATEGORY:MONITOR",
                            //"CATEGORY:PREVIEW",
                        ],
                    }),
                ],
            }));
        } catch (error) {
            console.log("Arcjet Service Error :: " + error);
            throw new ApiError(500, "Internal Server Error");
        }
    }

    // METHOD 3: Email Validation:
    emailvalidation({ mode = "LIVE" } = {}) {
        try {
            return arcjet({
                ...this.defaultConfig,
                rules: [
                    ...this.defaultConfig.rules,
                    validateEmail({
                        mode,
                        deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
                    }),
                ],
            });
        } catch (error) {
            console.log("Arcjet Service Error :: " + error);
            throw new ApiError(500, "Internal Server Error");
        }
    }

    // METHOD 4: SHIELD PROTECTION:
    shieldProtect({ mode = "LIVE" } = {}) {
        try {
            return (arcjet({
                ...this.defaultConfig,
                rules: [
                    ...this.defaultConfig.rules,
                    shield({
                        mode,
                    }),
                ],
            }));
        } catch (error) {
            console.log("Arcjet Service Error :: " + error);
            throw new ApiError(500, "Internal Server Error");
        }
    }

    // METHOD 5: Signup Form Protection:
    protectSignup({ mode = "LIVE", interval = "10m", max = 8 } = {}) {
        try {
            return (arcjet({
                ...this.defaultConfig,
                rules: [
                    ...this.defaultConfig.rules,
                    protectSignup({
                        email: {
                            mode,
                            block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
                        },
                        bots: {
                            mode,
                            allow: [], // "allow none" will block all detected bots
                        },
                        rateLimit: {
                            mode,
                            interval,
                            max,
                        },
                    }),
                ],
            }));
        } catch (error) {
            console.log("Arcjet Service Error :: " + error);
            throw new ApiError(500, "Internal Server Error");
        }
    }

    // METHOD 6: Sliding window rate limit:
    slidingWindowRateLimit({ mode = "LIVE", interval = "10m", max = 15 } = {}) {
        try {
            return (arcjet({
                ...this.defaultConfig,
                characteristics: ["userId"],
                rules: [
                    ...this.defaultConfig.rules,
                    slidingWindow({
                        mode,
                        interval,
                        max,
                    }),
                ],
            }));
        } catch (error) {
            console.log("Arcjet Service Error :: " + error);
            throw new ApiError(500, "Internal Server Error");
        }
    }
}

const arcjetService = new Arcjet();
export default arcjetService;
