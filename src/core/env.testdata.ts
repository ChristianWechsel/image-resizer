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

export type ApiKeyValidationTestdata = {
  name: string;
  value: string;
  expected: boolean;
};

export class ApiKeyValidationTestdataFactory {
  base64url_32_bytes(): ApiKeyValidationTestdata {
    return {
      name: "base64url of 32 bytes",
      value: "abcdEFGH-_".repeat(4) + "abc",
      expected: true,
    };
  }

  base64_32_bytes(): ApiKeyValidationTestdata {
    return {
      name: "base64 of 32 bytes with padding",
      value: "abcdEFGH+/".repeat(4) + "abc=",
      expected: true,
    };
  }

  too_short(): ApiKeyValidationTestdata {
    return { name: "too short", value: "a".repeat(42), expected: false };
  }

  too_long(): ApiKeyValidationTestdata {
    return { name: "too long", value: "a".repeat(44), expected: false };
  }

  empty_string(): ApiKeyValidationTestdata {
    return { name: "empty string", value: "", expected: false };
  }

  contains_whitespace(): ApiKeyValidationTestdata {
    return {
      name: "contains whitespace",
      value: "a".repeat(42) + " ",
      expected: false,
    };
  }

  invalid_character(): ApiKeyValidationTestdata {
    return {
      name: "invalid character",
      value: "a".repeat(42) + "!",
      expected: false,
    };
  }

  padding_in_the_middle(): ApiKeyValidationTestdata {
    return {
      name: "padding in the middle",
      value: "a".repeat(20) + "=" + "a".repeat(22),
      expected: false,
    };
  }
}
