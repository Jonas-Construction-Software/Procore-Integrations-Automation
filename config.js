
/**
 * Application Configuration
 * 
 * Environment is determined by the EnvName environment variable.
 * Add your project's environments to the switch cases below.
 * 
 * For sensitive values (passwords, tokens), prefer using environment variables
 * or a .env file (excluded via .gitignore) instead of hardcoding.
 */
export const AppConfig = {
  get EnvName() {
    return (process.env.EnvName || "qa").toLowerCase();
  },

  get BaseURL() {
    switch (this.EnvName) {
      case "qa":
        return process.env.BASE_URL || "https://integratortest.jonasportal.com/events-home?BearerToken=9a6433d7-a594-4734-a027-7da45516406e";
      case "staging":
        return process.env.BASE_URL || "https://your-app-staging.example.com";
      default:
        return process.env.BASE_URL || "https://your-app-qa.example.com";
    }
  },

  get ProcoreBaseURL() {
    switch (this.EnvName) {
      case "qa":
        return process.env.PROCORE_BASE_URL || "https://integratortest.jonasportal.com/events-home?BearerToken=9a6433d7-a594-4734-a027-7da45516406e";
      case "staging":
        return process.env.PROCORE_BASE_URL || "https://your-procore-staging.example.com";
      default:
        return process.env.PROCORE_BASE_URL || "https://your-procore-qa.example.com";
    }
  },

  get ProcoreUserName() {
    return process.env.PROCORE_USERNAME || "procore_testuser";
  },

  get ProcorePassword() {
    return process.env.PROCORE_PASSWORD || "procore_testpassword";
  },

  get UserName() {
    return process.env.TEST_USERNAME || "testuser";
  },

  get Password() {
    return process.env.TEST_PASSWORD || "testpassword";
  },

  get SecondUserName() {
    return process.env.TEST_SECOND_USERNAME || "testuser2";
  },

  get SecondUserPassword() {
    return process.env.TEST_SECOND_PASSWORD || "testpassword2";
  },
  };