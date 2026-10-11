import { HandleEnv } from "@christian-wechsel/typed-env-handler";
import { createEnv } from "./env.js";
import {
  NodeEnvValidationTestdataFactory,
  type NodeEnvValidationTestdata,
} from "./env.testdata.js";

jest.mock("@christian-wechsel/typed-env-handler", () => ({
  HandleEnv: Object.assign(jest.fn(), {
    string: jest.fn(() => ({ type: "string" })),
    number: jest.fn(() => ({ type: "number" })),
  }),
}));

function getCapturedValidator() {
  const [validator] = jest.mocked(HandleEnv).mock.calls[0];
  return validator;
}

describe("createEnv", () => {
  beforeEach(() => {
    jest.mocked(HandleEnv).mockClear();
  });

  it("returns the created HandleEnv instance", () => {
    const env = createEnv();

    expect(env).toBe(jest.mocked(HandleEnv).mock.instances[0]);
  });

  it("requires all variables injected by Cloud Run and the deployment", () => {
    createEnv();

    expect(Object.keys(getCapturedValidator()).sort()).toEqual([
      "K_CONFIGURATION",
      "K_REVISION",
      "K_SERVICE",
      "NODE_ENV",
      "PORT",
      "PROJECT_ID",
      "STORAGE_BUCKET_NAME",
    ]);
  });

  it("reads PORT as number", () => {
    createEnv();

    expect(getCapturedValidator().PORT).toEqual({ type: "number" });
  });

  it.each([
    "K_SERVICE",
    "K_REVISION",
    "K_CONFIGURATION",
    "PROJECT_ID",
    "STORAGE_BUCKET_NAME",
  ])("reads %s as string", (key) => {
    createEnv();

    expect(getCapturedValidator()[key]).toEqual({ type: "string" });
  });

  describe("NODE_ENV", () => {
    it("defaults to production", () => {
      createEnv();

      expect(getCapturedValidator().NODE_ENV.defaultValue).toBe("production");
    });

    it("passes the value through unchanged on conversion", () => {
      createEnv();

      expect(getCapturedValidator().NODE_ENV.conversion("development")).toBe(
        "development",
      );
    });

    const testData = new NodeEnvValidationTestdataFactory();
    it.each<NodeEnvValidationTestdata>([
      testData.development(),
      testData.production(),
      testData.test(),
      testData.unknown_environment(),
      testData.empty_string(),
      testData.wrong_casing(),
    ])("validation for $name returns $expected", ({ value, expected }) => {
      createEnv();

      expect(getCapturedValidator().NODE_ENV.validation(value)).toBe(expected);
    });
  });
});
