export type NodeEnvValidationTestdata = {
  name: string;
  value: string;
  expected: boolean;
};

export class NodeEnvValidationTestdataFactory {
  development(): NodeEnvValidationTestdata {
    return { name: "development", value: "development", expected: true };
  }

  production(): NodeEnvValidationTestdata {
    return { name: "production", value: "production", expected: true };
  }

  test(): NodeEnvValidationTestdata {
    return { name: "test", value: "test", expected: true };
  }

  unknown_environment(): NodeEnvValidationTestdata {
    return { name: "unknown environment", value: "staging", expected: false };
  }

  empty_string(): NodeEnvValidationTestdata {
    return { name: "empty string", value: "", expected: false };
  }

  wrong_casing(): NodeEnvValidationTestdata {
    return { name: "wrong casing", value: "Production", expected: false };
  }
}
